const storageKey = "doya-kpi-levelup-v2";
const allWorkDays = [0, 1, 2, 3, 4, 5, 6];
const employeeAppVersion = "20260603-mobile-submit-sync-1";
const cloudStaffTimeoutMs = 6000;

function appStorageKey() {
  return window.LeveloveAuth?.stateStorageKey?.(storageKey) || storageKey;
}

const defaultStaff = [
  { id: "hall-manager", name: "홀 매니저", role: "hall-manager", workDays: allWorkDays, offDays: [], active: true },
  { id: "hall-a", name: "홀직원 A", role: "hall", workDays: allWorkDays, offDays: [], active: true },
  { id: "hall-b", name: "홀직원 B", role: "hall", workDays: allWorkDays, offDays: [], active: true },
  { id: "kitchen-manager", name: "주방 매니저", role: "kitchen-manager", workDays: allWorkDays, offDays: [], active: true },
  { id: "kitchen-a", name: "주방직원 A", role: "kitchen", workDays: allWorkDays, offDays: [], active: true },
  { id: "kitchen-b", name: "주방직원 B", role: "kitchen", workDays: allWorkDays, offDays: [], active: true },
  { id: "marketer-a", name: "마케터 A", role: "marketer", workDays: allWorkDays, offDays: [], active: true },
];

let state = loadState();
let staff = normalizeStaff(state.staff);
let showInactiveStaff = false;
let lastAddedStaffId = "";

const els = {
  staffEditor: document.querySelector("#staffEditor"),
  staffSummary: document.querySelector("#staffSummary"),
  addStaffBtn: document.querySelector("#addStaffBtn"),
  resetStaffBtn: document.querySelector("#resetStaffBtn"),
  syncStatus: document.querySelector("#staffSyncStatus"),
  showInactiveStaff: document.querySelector("#showInactiveStaff"),
};

init();

function init() {
  const authResult = window.LeveloveAuth?.requireRole?.(["owner", "admin", "manager"]);
  if (authResult && !authResult.ok) return;
  renderStaffEditor();
  setSyncStatus("로컬 목록 표시 중");
  syncCloudState();

  els.addStaffBtn.addEventListener("click", addStaff);
  els.resetStaffBtn.addEventListener("click", resetStaff);
  els.staffEditor.addEventListener("input", updateStaff);
  els.staffEditor.addEventListener("change", updateStaff);
  els.staffEditor.addEventListener("change", addOffDay);
  els.staffEditor.addEventListener("change", updateWorkDay);
  els.staffEditor.addEventListener("click", removeStaff);
  els.staffEditor.addEventListener("click", removeOffDay);
  els.staffEditor.addEventListener("click", copyEmployeeLink);
  els.staffEditor.addEventListener("click", copyManagerLink);
  els.staffEditor.addEventListener("click", regenerateEmployeeLink);
  els.staffEditor.addEventListener("click", restoreStaff);
  els.showInactiveStaff?.addEventListener("change", () => {
    showInactiveStaff = els.showInactiveStaff.checked;
    renderStaffEditor();
  });
}

function loadState() {
  const fallback = {
    referenceMonth: toMonthInput(new Date()),
    monthlySales: 500000000,
    staff: defaultStaff,
    personalEntries: [],
    teamEntries: [],
    selfChecks: [],
  };

  try {
    const saved = JSON.parse(localStorage.getItem(appStorageKey()));
    return { ...fallback, ...saved };
  } catch {
    return fallback;
  }
}

function saveState() {
  state.staff = staff;
  localStorage.setItem(appStorageKey(), JSON.stringify(state));
  setSyncStatus("저장 중...");
  return saveStaffStateToCloud()
    .then(() => setSyncStatus("클라우드 저장됨"))
    .catch((error) => {
      console.warn(error);
      setSyncStatus("로컬 저장됨");
    });
}

async function saveStaffStateToCloud() {
  const localStaff = normalizeStaff(staff, { fallbackToDefault: false });
  state.staff = localStaff;
  localStorage.setItem(appStorageKey(), JSON.stringify(state));
  if (typeof cloudEnabled !== "function" || !cloudEnabled()) return true;

  const cloudState = await withTimeout(loadStateFromCloud(), cloudStaffTimeoutMs).catch(() => null);
  const nextState = {
    ...(cloudState || state),
    staff: mergeStaffLists(cloudState?.staff, localStaff, { prefer: "local" }),
  };
  state = nextState;
  staff = normalizeStaff(nextState.staff);
  localStorage.setItem(appStorageKey(), JSON.stringify(state));
  await saveStateToCloud(nextState);
  return true;
}

async function syncCloudState() {
  try {
    setSyncStatus("클라우드 목록 확인 중");
    const cloudState = await withTimeout(loadStateFromCloud(), cloudStaffTimeoutMs);
    if (!cloudState) {
      ensureStaffAccessTokens({ save: false });
      state.staff = staff;
      localStorage.setItem(appStorageKey(), JSON.stringify(state));
      setSyncStatus("로컬 목록 사용 중");
      return;
    }
    const localStaff = normalizeStaff(staff, { fallbackToDefault: false });
    const cloudStaff = normalizeStaff(cloudState.staff, { fallbackToDefault: false });
    state = {
      ...state,
      ...cloudState,
      staff: cloudStaff.length ? cloudStaff : localStaff,
    };
    staff = normalizeStaff(state.staff);
    const addedTokens = ensureStaffAccessTokens({ save: false });
    state.staff = staff;
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
    renderStaffEditor();
    setSyncStatus("클라우드 연동됨");
    if (addedTokens) saveState();
  } catch (error) {
    console.warn(error);
    setSyncStatus("로컬 목록 사용 중");
  }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Cloud sync timeout")), ms);
    }),
  ]);
}

function normalizeStaff(savedStaff, options = {}) {
  const fallbackToDefault = options.fallbackToDefault !== false;
  const source = Array.isArray(savedStaff) && savedStaff.length ? savedStaff : (fallbackToDefault ? defaultStaff : []);
  return source.map((person, index) => {
    const role = normalizeRole(person.role || person.type);
    return {
      ...person,
      id: person.id || `staff-${index + 1}`,
      name: String(person.name || "").trim() || fallbackStaffName(role, index),
      role,
      workDays: normalizeWorkDays(person.workDays),
      offDays: normalizeOffDays(person.offDays),
      active: person.active !== false,
      accessToken: String(person.accessToken || ""),
      createdAt: person.createdAt || createdAtFromStaffId(person.id) || "",
    };
  });
}

function mergeStaffLists(baseStaff, incomingStaff, options = {}) {
  const prefer = options.prefer || "local";
  const base = normalizeStaff(baseStaff, { fallbackToDefault: false });
  const incoming = normalizeStaff(incomingStaff, { fallbackToDefault: false });
  const map = new Map(base.map((person) => [person.id, person]));
  incoming.forEach((person) => {
    const previous = map.get(person.id);
    if (!previous) {
      map.set(person.id, person);
      return;
    }
    map.set(person.id, prefer === "cloud"
      ? {
        ...person,
        ...previous,
        accessToken: previous.accessToken || person.accessToken,
      }
      : {
        ...previous,
        ...person,
        accessToken: person.accessToken || previous.accessToken,
      });
  });
  return [...map.values()].sort(sortStaffForStorage);
}

function sortStaffForStorage(a, b) {
  const groupOrder = { "hall-manager": 0, hall: 1, "hall-part": 2, "kitchen-manager": 3, kitchen: 4, "kitchen-part": 5, marketer: 6 };
  const aAdded = isAddedStaff(a);
  const bAdded = isAddedStaff(b);
  if (aAdded !== bAdded) return aAdded ? 1 : -1;
  const groupDiff = (groupOrder[a.role] ?? 9) - (groupOrder[b.role] ?? 9);
  if (groupDiff) return groupDiff;
  return String(a.createdAt || a.id).localeCompare(String(b.createdAt || b.id));
}

function ensureStaffAccessTokens(options = {}) {
  const shouldSave = options.save !== false;
  let changed = false;
  staff = staff.map((person) => {
    if (person.accessToken) return person;
    changed = true;
    return { ...person, accessToken: createAccessToken() };
  });
  if (changed) {
    state.staff = staff;
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
    if (shouldSave) saveState();
  }
  return changed;
}

function renderStaffEditor() {
  const visibleStaff = showInactiveStaff ? staff : staff.filter((person) => person.active !== false);
  const inactiveCount = staff.filter((person) => person.active === false).length;
  renderStaffSummary();
  if (!visibleStaff.length) {
    els.staffEditor.innerHTML = `
      <div class="staff-empty">
        <strong>표시할 직원이 없습니다.</strong>
        <span>${inactiveCount ? "비활성 직원 보기를 켜면 삭제 처리된 직원을 확인할 수 있어요." : "직원 추가 버튼으로 새 직원을 등록하세요."}</span>
      </div>
    `;
    return;
  }
  const recentStaff = visibleStaff.filter(isAddedStaff).sort(sortNewestStaff);
  const groupedStaff = visibleStaff.filter((person) => !isAddedStaff(person));
  const groups = [
    ["new", "최근 추가 직원", recentStaff],
    ["manager", "관리자/매니저", groupedStaff.filter((person) => isManagerRole(person.role))],
    ["hall", "홀 직원", groupedStaff.filter((person) => !isManagerRole(person.role) && roleFamily(person.role) === "hall")],
    ["kitchen", "주방 직원", groupedStaff.filter((person) => !isManagerRole(person.role) && roleFamily(person.role) === "kitchen")],
    ["marketer", "마케팅 직원", groupedStaff.filter((person) => !isManagerRole(person.role) && roleFamily(person.role) === "marketer")],
  ].filter(([, , people]) => people.length);

  els.staffEditor.innerHTML = groups.map(([key, title, people]) => `
    <section class="staff-group is-${key}">
      <div class="staff-group-head">
        <strong>${title}</strong>
        <span>${people.length}명</span>
      </div>
      <div class="staff-group-list">
        ${people.map(renderStaffCard).join("")}
      </div>
    </section>
  `).join("");
}

function renderStaffSummary() {
  if (!els.staffSummary) return;
  const active = staff.filter((person) => person.active !== false);
  const regular = active.filter((person) => !isManagerRole(person.role));
  const manager = active.filter((person) => isManagerRole(person.role));
  const inactive = staff.filter((person) => person.active === false);
  els.staffSummary.innerHTML = [
    ["전체 직원", `${active.length}명`, "현재 사용 중"],
    ["직원앱 링크", `${regular.length}개`, "일반 직원용"],
    ["관리자 역할", `${manager.length}명`, "승인/검수 담당"],
    ["비활성", `${inactive.length}명`, "기록은 보존"],
  ].map(([label, value, meta]) => `
    <article class="staff-summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${meta}</small>
    </article>
  `).join("");
}

function renderStaffCard(person) {
  const disabled = person.active === false ? "disabled" : "";
  return `
    <article class="staff-row ${person.active === false ? "is-disabled" : ""} ${person.id === lastAddedStaffId ? "is-new" : ""}">
      <div class="staff-card-head">
        <div>
          <span class="staff-role-chip">${roleLabel(person.role)}</span>
          <strong>${escapeHtml(person.name)}</strong>
          <small>${person.active === false ? "비활성 직원" : isManagerRole(person.role) ? "관리자 화면 사용" : "직원앱 링크 사용"}</small>
        </div>
        <div class="staff-card-actions">
          ${person.active === false
            ? `<button class="btn ghost staff-restore" data-restore-staff-id="${person.id}" type="button">복구</button>`
            : `<button class="btn danger staff-remove" data-remove-staff-id="${person.id}" type="button">삭제</button>`}
        </div>
      </div>
      <div class="staff-card-fields">
        <label>
          이름
          <input data-staff-id="${person.id}" data-field="name" type="text" value="${escapeHtml(person.name)}" ${disabled} />
        </label>
        <label>
          역할
          <select data-staff-id="${person.id}" data-field="role" ${disabled}>
            ${roleOptions(person.role)}
          </select>
        </label>
      </div>
      <div class="staff-offdays">
        <div class="workday-picker">
          <strong>근무요일</strong>
          <div>${renderWorkDays(person)}</div>
        </div>
        <label>
          휴무 추가
          <input data-offday-add="${person.id}" type="date" ${disabled} />
        </label>
        <div class="offday-list">${renderOffDays(person)}</div>
      </div>
      ${renderEmployeeLinkBox(person)}
    </article>
  `;
}

function renderEmployeeLinkBox(person) {
  if (isManagerRole(person.role)) {
    const link = managerLinkFor(person);
    return `
      <div class="staff-private-link">
        <div>
          <strong>매니저 전용 링크</strong>
          <span>${escapeHtml(person.name)} 매니저가 로그인 없이 승인/검수 화면에 들어갑니다.</span>
          <code class="staff-access-code">매니저 ID: ${escapeHtml(person.id)}</code>
        </div>
        <input type="text" readonly value="${escapeHtml(link)}" aria-label="${escapeHtml(person.name)} 매니저 전용 링크" />
        <div class="staff-link-actions">
          <button class="btn primary" type="button" data-copy-manager-link="${person.id}">링크 복사</button>
          <a class="btn ghost" href="${escapeHtml(link)}" target="_blank" rel="noreferrer">열기</a>
          <button class="btn ghost" type="button" data-regenerate-employee-link="${person.id}">새 링크 발급</button>
        </div>
      </div>
    `;
  }
  const link = employeeLinkFor(person);
  return `
    <div class="staff-private-link">
      <div>
        <strong>직원 전용 링크</strong>
        <span>${escapeHtml(person.name)} 이름으로 직원앱이 열립니다.</span>
        <code class="staff-access-code">직원 ID: ${escapeHtml(person.id)}</code>
      </div>
      <input type="text" readonly value="${escapeHtml(link)}" aria-label="${escapeHtml(person.name)} 직원 전용 링크" />
      <div class="staff-link-actions">
        <button class="btn primary" type="button" data-copy-employee-link="${person.id}">링크 복사</button>
        <a class="btn ghost" href="${escapeHtml(link)}" target="_blank" rel="noreferrer">열기</a>
        <button class="btn ghost" type="button" data-regenerate-employee-link="${person.id}">새 링크 발급</button>
      </div>
    </div>
  `;
}

function managerLinkFor(person) {
  const url = new URL("levelove-admin-9c4f2a7.html", window.location.href);
  const storeId = window.LeveloveAuth?.activeStoreId?.() || "";
  if (storeId && storeId !== "main") url.searchParams.set("store", storeId);
  url.searchParams.set("manager", person.id);
  url.searchParams.set("token", person.accessToken || "");
  url.searchParams.set("name", person.name || "");
  url.searchParams.set("role", person.role || "manager");
  url.searchParams.set("v", employeeAppVersion);
  url.hash = "approval";
  return url.href;
}

function employeeLinkFor(person) {
  const url = new URL("employee-check.html", window.location.href);
  const storeId = window.LeveloveAuth?.activeStoreId?.() || "";
  if (storeId && storeId !== "main") url.searchParams.set("store", storeId);
  url.searchParams.set("staff", person.id);
  url.searchParams.set("token", person.accessToken || "");
  url.searchParams.set("name", person.name || "");
  url.searchParams.set("role", person.role || "hall");
  url.searchParams.set("v", employeeAppVersion);
  return url.href;
}

async function copyEmployeeLink(event) {
  const staffId = event.target.dataset.copyEmployeeLink;
  if (!staffId) return;
  const person = staff.find((item) => item.id === staffId);
  if (!person) return;
  const link = employeeLinkFor(person);
  try {
    await navigator.clipboard.writeText(link);
    setSyncStatus(`${person.name} 전용 링크 복사됨`);
  } catch (error) {
    console.warn(error);
    setSyncStatus(`복사 실패: ${link}`);
  }
}

function regenerateEmployeeLink(event) {
  const staffId = event.target.dataset.regenerateEmployeeLink;
  if (!staffId) return;
  const person = staff.find((item) => item.id === staffId);
  if (!person) return;
  if (!confirm(`${person.name} 직원의 전용 링크를 새로 발급할까요? 이전 링크는 사용할 수 없게 됩니다.`)) return;
  staff = staff.map((item) => item.id === staffId ? { ...item, accessToken: createAccessToken() } : item);
  saveState();
  renderStaffEditor();
}

function roleOptions(selectedRole) {
  return [
    ["hall", "홀 일반직원"],
    ["hall-part", "홀 파트타임"],
    ["hall-manager", "홀 매니저"],
    ["kitchen", "주방 일반직원"],
    ["kitchen-part", "주방 파트타임"],
    ["kitchen-manager", "주방 매니저"],
    ["marketer", "마케터"],
  ].map(([value, label]) => `<option value="${value}" ${selectedRole === value ? "selected" : ""}>${label}</option>`).join("");
}

function updateStaff(event) {
  const staffId = event.target.dataset.staffId;
  const field = event.target.dataset.field;
  if (!staffId || !field) return;
  staff = staff.map((person) => (
    person.id === staffId
      ? { ...person, [field]: field === "name" ? event.target.value : event.target.value.trim() || person[field] }
      : person
  ));
  saveState();
}

function addStaff() {
  const count = staff.filter((person) => person.active !== false).length + 1;
  const nextPerson = {
    id: `staff-${Date.now().toString(36)}`,
    name: `새 직원 ${count}`,
    role: "hall",
    workDays: [...allWorkDays],
    offDays: [],
    active: true,
    accessToken: createAccessToken(),
    createdAt: new Date().toISOString(),
  };
  staff = [...staff, nextPerson];
  lastAddedStaffId = nextPerson.id;
  saveState();
  renderStaffEditor();
  setSyncStatus(`${nextPerson.name} 추가됨 · 최신 직원앱 링크 생성됨`);
  requestAnimationFrame(() => {
    document.querySelector(".staff-row.is-new")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

async function copyManagerLink(event) {
  const staffId = event.target.dataset.copyManagerLink;
  if (!staffId) return;
  const person = staff.find((item) => item.id === staffId);
  if (!person) return;
  const link = managerLinkFor(person);
  try {
    await navigator.clipboard.writeText(link);
    setSyncStatus(`${person.name} 매니저 링크 복사됨`);
  } catch (error) {
    console.warn(error);
    setSyncStatus(`복사 실패: ${link}`);
  }
}

function addOffDay(event) {
  const staffId = event.target.dataset.offdayAdd;
  const date = event.target.value;
  if (!staffId || !date) return;
  staff = staff.map((person) => (
    person.id === staffId
      ? { ...person, offDays: normalizeOffDays([...(person.offDays || []), date]) }
      : person
  ));
  saveState();
  renderStaffEditor();
}

function updateWorkDay(event) {
  const value = event.target.dataset.workday;
  if (!value) return;
  const [staffId, day] = value.split("|");
  const dayNumber = Number(day);
  staff = staff.map((person) => {
    if (person.id !== staffId) return person;
    const current = normalizeWorkDays(person.workDays);
    const next = event.target.checked
      ? normalizeWorkDays([...current, dayNumber])
      : normalizeWorkDays(current.filter((item) => item !== dayNumber));
    return { ...person, workDays: next.length ? next : current };
  });
  saveState();
  renderStaffEditor();
}

function removeStaff(event) {
  const staffId = event.target.dataset.removeStaffId;
  if (!staffId) return;
  const person = staff.find((item) => item.id === staffId);
  if (!person || person.active === false) return;
  if (!confirm(`${person.name} 직원을 삭제할까요?\n직원 목록에서는 숨겨지고, 기존 기록은 보존됩니다.`)) return;
  staff = staff.map((item) => item.id === staffId ? { ...item, active: false } : item);
  saveState();
  renderStaffEditor();
}

function restoreStaff(event) {
  const staffId = event.target.dataset.restoreStaffId;
  if (!staffId) return;
  const person = staff.find((item) => item.id === staffId);
  if (!person || person.active !== false) return;
  staff = staff.map((item) => item.id === staffId ? { ...item, active: true } : item);
  saveState();
  renderStaffEditor();
}

function removeOffDay(event) {
  const value = event.target.dataset.removeOffday;
  if (!value) return;
  const [staffId, date] = value.split("|");
  staff = staff.map((person) => (
    person.id === staffId
      ? { ...person, offDays: normalizeOffDays((person.offDays || []).filter((day) => day !== date)) }
      : person
  ));
  saveState();
  renderStaffEditor();
}

function resetStaff() {
  if (!confirm("직원 목록을 기본값으로 복원할까요? 기존 KPI 기록은 삭제되지 않습니다.")) return;
  staff = normalizeStaff(defaultStaff);
  ensureStaffAccessTokens();
  saveState();
  renderStaffEditor();
}

function renderOffDays(person) {
  const days = normalizeOffDays(person.offDays);
  if (!days.length) return `<span class="offday-empty">등록된 휴무 없음</span>`;
  return days.map((date) => `
    <button class="offday-chip" type="button" data-remove-offday="${person.id}|${date}" title="휴무 삭제">
      ${date} ×
    </button>
  `).join("");
}

function renderWorkDays(person) {
  const selected = normalizeWorkDays(person.workDays);
  return weekdayLabels().map(([day, label]) => `
    <label class="workday-chip">
      <input type="checkbox" data-workday="${person.id}|${day}" ${selected.includes(day) ? "checked" : ""} ${person.active === false ? "disabled" : ""} />
      <span>${label}</span>
    </label>
  `).join("");
}

function normalizeWorkDays(days) {
  if (!Array.isArray(days) || !days.length) return [...allWorkDays];
  return [...new Set(days.map(Number).filter((day) => day >= 0 && day <= 6))].sort((a, b) => a - b);
}

function normalizeOffDays(days) {
  if (!Array.isArray(days)) return [];
  return [...new Set(days.filter(Boolean))].sort();
}

function weekdayLabels() {
  return [
    [1, "월"],
    [2, "화"],
    [3, "수"],
    [4, "목"],
    [5, "금"],
    [6, "토"],
    [0, "일"],
  ];
}

function roleLabel(role) {
  const labels = {
    "hall-manager": "홀 매니저",
    hall: "홀 일반직원",
    "hall-part": "홀 파트타임",
    "kitchen-manager": "주방 매니저",
    kitchen: "주방 일반직원",
    "kitchen-part": "주방 파트타임",
    marketer: "마케터",
  };
  return labels[role] || "홀 일반직원";
}

function roleFamily(role) {
  if (String(role).startsWith("kitchen")) return "kitchen";
  if (role === "marketer") return "marketer";
  return "hall";
}

function isAddedStaff(person) {
  return String(person.id || "").startsWith("staff-");
}

function sortNewestStaff(a, b) {
  return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
}

function createdAtFromStaffId(id) {
  const encoded = String(id || "").replace(/^staff-/, "").split("-")[0];
  if (!encoded || encoded === id) return "";
  const timestamp = Number.parseInt(encoded, 36);
  if (!Number.isFinite(timestamp) || timestamp < 1000000000000) return "";
  return new Date(timestamp).toISOString();
}

function normalizeRole(role) {
  if (["hall-manager", "hall", "hall-part", "kitchen-manager", "kitchen", "kitchen-part", "marketer"].includes(role)) return role;
  if (role === "manager") return "hall-manager";
  if (role === "주방") return "kitchen";
  if (role === "마케터" || role === "marketing") return "marketer";
  if (role === "파트타임" || role === "홀") return "hall";
  return "hall";
}

function isManagerRole(role) {
  return role === "hall-manager" || role === "kitchen-manager";
}

function createAccessToken() {
  const bytes = new Uint8Array(12);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function fallbackStaffName(role, index) {
  const prefix = role === "marketer" ? "마케터" : role?.startsWith("kitchen") ? "주방 직원" : "홀 직원";
  return `${prefix} ${index + 1}`;
}

function setSyncStatus(text) {
  if (els.syncStatus) els.syncStatus.textContent = text;
}

function toMonthInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}









