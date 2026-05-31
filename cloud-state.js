const cloudStateTable = "doya_app_state";
const cloudStateId = "main";

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
