const cloudStateTable = "doya_app_state";
const cloudStateId = "main";
const analyticsEventTypes = new Set([
  "employee_checkin",
  "employee_submit",
  "employee_checkout",
  "manager_review",
  "manager_approve",
  "task_completed",
  "link_opened",
]);

function currentCloudStateId() {
  return window.LeveloveAuth?.storeStateId?.() || cloudStateId;
}

function currentStateStorageKey() {
  return window.LeveloveAuth?.stateStorageKey?.(storageKey) || storageKey;
}

function cloudConfig() {
  const config = window.DOYA_SUPABASE || {};
  return {
    url: String(config.url || "").replace(/\/$/, ""),
    anonKey: String(config.anonKey || ""),
  };
}

function cloudEnabled() {
  const config = cloudConfig();
  return Boolean(config.url && config.anonKey);
}

async function loadStateFromCloud() {
  if (!cloudEnabled()) return null;
  const config = cloudConfig();
  const response = await fetch(`${config.url}/rest/v1/${cloudStateTable}?id=eq.${encodeURIComponent(currentCloudStateId())}&select=data`, {
    headers: cloudHeaders(config),
  });
  if (!response.ok) throw new Error("Supabase state load failed");
  const rows = await response.json();
  const state = rows[0]?.data || null;
  if (!state) return null;
  try {
    const selfChecks = await loadSelfCheckEntriesFromCloud();
    return {
      ...state,
      selfChecks: mergeCloudSelfCheckEntries(state.selfChecks, selfChecks),
    };
  } catch (error) {
    console.warn("Supabase self-check row load skipped", error);
    return state;
  }
}

async function saveStateToCloud(state) {
  safeCacheState(state);
  if (!cloudEnabled()) return;
  const config = cloudConfig();
  const response = await fetch(`${config.url}/rest/v1/${cloudStateTable}`, {
    method: "POST",
    headers: {
      ...cloudHeaders(config),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: currentCloudStateId(),
      data: state,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Supabase state save failed");
}

function cloudSelfCheckPrefix(storeStateId = currentCloudStateId()) {
  return `selfcheck:${storeStateId}:`;
}

function cloudSelfCheckEntryId(entry, storeStateId = currentCloudStateId()) {
  const date = String(entry?.date || "").trim();
  const staffId = String(entry?.staffId || "").trim();
  if (!date || !staffId) return "";
  return `${cloudSelfCheckPrefix(storeStateId)}${date}:${staffId}`;
}

async function loadSelfCheckEntriesFromCloud(storeStateId = currentCloudStateId()) {
  if (!cloudEnabled()) return [];
  const config = cloudConfig();
  const prefix = `${encodeURIComponent(cloudSelfCheckPrefix(storeStateId))}*`;
  const response = await fetch(`${config.url}/rest/v1/${cloudStateTable}?id=like.${prefix}&select=id,data,updated_at`, {
    headers: cloudHeaders(config),
  });
  if (!response.ok) throw new Error("Supabase self-check row load failed");
  const rows = await response.json();
  return rows
    .map((row) => normalizeCloudSelfCheckEntry(row?.data, row))
    .filter(Boolean);
}

async function saveSelfCheckEntryToCloud(entry) {
  if (!cloudEnabled()) return true;
  const rowId = cloudSelfCheckEntryId(entry);
  if (!rowId) throw new Error("Self-check row requires date and staffId");
  const config = cloudConfig();
  const now = new Date().toISOString();
  const data = {
    ...entry,
    updatedAt: entry.updatedAt || now,
    cloudRowId: rowId,
  };
  const response = await fetch(`${config.url}/rest/v1/${cloudStateTable}`, {
    method: "POST",
    headers: {
      ...cloudHeaders(config),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: rowId,
      data,
      updated_at: data.updatedAt,
    }),
  });
  if (!response.ok) throw new Error("Supabase self-check row save failed");
  return true;
}

async function markSelfCheckEntryDeletedInCloud(entry) {
  if (!entry) return true;
  return saveSelfCheckEntryToCloud({
    ...entry,
    status: "deleted",
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function normalizeCloudSelfCheckEntry(entry, row = {}) {
  if (!entry || typeof entry !== "object") return null;
  return {
    ...entry,
    updatedAt: entry.updatedAt || row.updated_at || entry.submittedAt || entry.createdAt || "",
    cloudRowId: entry.cloudRowId || row.id || "",
  };
}

function cloudSelfCheckMergeKey(entry) {
  if (!entry) return "";
  return entry.id || `${entry.date || ""}::${entry.staffId || ""}`;
}

function cloudSelfCheckVersionTime(entry) {
  const value = entry?.deletedAt || entry?.updatedAt || entry?.approvedAt || entry?.rejectedAt || entry?.submittedAt || entry?.createdAt || "";
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function mergeCloudSelfCheckEntries(...entryLists) {
  const map = new Map();
  entryLists.flat().forEach((entry) => {
    const normalized = normalizeCloudSelfCheckEntry(entry);
    const key = cloudSelfCheckMergeKey(normalized);
    if (!key) return;
    const previous = map.get(key);
    if (!previous || cloudSelfCheckVersionTime(normalized) >= cloudSelfCheckVersionTime(previous)) {
      map.set(key, normalized);
    }
  });
  return [...map.values()]
    .filter((entry) => entry.status !== "deleted")
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
}

function cloudHeaders(config) {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
  };
}

function saveStateEverywhere(state) {
  saveStateToCloud(state).catch((error) => {
    console.warn(error);
  });
}

function safeCacheState(state) {
  try {
    localStorage.setItem(currentStateStorageKey(), JSON.stringify(state));
  } catch (error) {
    console.warn("Local state cache skipped", error);
  }
}

function normalizeAnalyticsEvents(events) {
  if (!Array.isArray(events)) return [];
  return events
    .filter((event) => event && analyticsEventTypes.has(event.type) && event.timestamp)
    .map((event) => ({
      ...event,
      storeId: event.storeId || analyticsStoreId(),
      date: event.date || analyticsDate(event.timestamp),
    }))
    .slice(-5000);
}

function mergeAnalyticsEvents(...eventLists) {
  const map = new Map();
  eventLists.flatMap(normalizeAnalyticsEvents).forEach((event) => {
    const key = event.id || `${event.type}:${event.timestamp}:${event.staffId || ""}:${event.entryId || ""}:${event.taskId || ""}`;
    map.set(key, { ...(map.get(key) || {}), ...event, id: key });
  });
  return [...map.values()]
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
    .slice(-5000);
}

function analyticsStoreId() {
  const storeId = window.LeveloveAuth?.activeStoreId?.() || "";
  return storeId || "main";
}

function analyticsDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function createAnalyticsEvent(type, detail = {}) {
  if (!analyticsEventTypes.has(type)) return null;
  const timestamp = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    storeId: detail.storeId || analyticsStoreId(),
    date: detail.date || analyticsDate(timestamp),
    timestamp,
    ...detail,
  };
}

function appendAnalyticsEvent(state, type, detail = {}) {
  if (!state) return null;
  const event = createAnalyticsEvent(type, detail);
  if (!event) return null;
  if (event.dedupeKey && normalizeAnalyticsEvents(state.analyticsEvents).some((item) => (
    item.type === event.type && item.dedupeKey === event.dedupeKey
  ))) {
    return null;
  }
  state.analyticsEvents = mergeAnalyticsEvents(state.analyticsEvents, [event]);
  return event;
}
