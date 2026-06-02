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
  return rows[0]?.data || null;
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
