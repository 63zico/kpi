const storageKey = "doya-kpi-levelup-v2";
const levelXpThresholds = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];
const teamReviewTarget = 30;
const specialCleanAreas = [
  { id: "fridge-gasket", xp: 10, ko: "냉장고 손잡이/문틈/고무패킹" },
  { id: "fridge-inside", xp: 10, ko: "냉장고 안 청소" },
  { id: "freezer-defrost", xp: 10, ko: "냉동고 성에 제거" },
  { id: "sink-drain", xp: 10, ko: "싱크대 하부/배수구 주변" },
  { id: "glass-cleaning", xp: 10, ko: "유리청소" },
  { id: "hood-grease", xp: 10, ko: "후드기름때 청소" },
  { id: "prep-table-legs", xp: 10, ko: "조리대 밑/다리 주변" },
  { id: "storage-shelves", xp: 10, ko: "재료 보관 선반" },
  { id: "gas-room", xp: 10, ko: "가스실 청소" },
];

const allWorkDays = [0, 1, 2, 3, 4, 5, 6];

const defaultStaff = [
  { id: "hall-manager", name: "홀 매니저", role: "hall-manager", active: true },
  { id: "hall-a", name: "홀직원 A", role: "hall", active: true },
  { id: "hall-b", name: "홀직원 B", role: "hall", active: true },
  { id: "kitchen-manager", name: "주방 매니저", role: "kitchen-manager", active: true },
  { id: "kitchen-a", name: "주방직원 A", role: "kitchen", active: true },
  { id: "kitchen-b", name: "주방직원 B", role: "kitchen", active: true },
  { id: "marketer-a", name: "마케터 A", role: "marketer", active: true },
];

const defaultBonusSettings = {
  kpiTopThreshold: 9.5,
  kpiTopBonus: 500000,
  kpiGoodThreshold: 9,
  kpiGoodBonus: 300000,
  kpiMinimumThreshold: 8.5,
  pointBaseThreshold: 60,
  pointBaseBonus: 200000,
  pointGoodThreshold: 100,
  pointGoodBonus: 400000,
  pointTopThreshold: 150,
  pointTopBonus: 600000,
  teamTopThreshold: 9,
  teamTopBonus: 500000,
  teamGoodThreshold: 8,
  teamGoodBonus: 300000,
  salesBaseAmount: 500000000,
  salesBaseBonus: 300000,
  salesStepAmount: 50000000,
  salesStepBonus: 200000,
  managerSalesBaseAmount: 500000000,
  managerSalesBaseBonus: 700000,
  managerSalesStepAmount: 50000000,
  managerSalesStepBonus: 700000,
  partTimeRate: 0.5,
};

const defaultStoreSettings = {
  storeName: "우리 매장",
  industry: "restaurant",
  template: "korean-restaurant",
  defaultLanguage: "ko",
  rankingVisibility: "private",
  bonusEnabled: false,
  operationPoints: ["추천 메뉴", "리뷰 요청", "멤버십/적립 안내", "피크타임 역할"],
  dailyOperationPoints: [],
  dailyOperationDate: "",
  teamChallengeSettings: {
    enabled: true,
    title: "이번주 팀 챌린지",
    primaryLabel: "리뷰",
    primaryTarget: 30,
    secondaryLabel: "클레임",
  },
  questSettings: {
    attendance: true,
    cleaning: true,
    goal: true,
    photo: true,
    help: true,
    serviceXp: true,
  },
};

const defaultPerformanceItems = {
  hall: [
    { id: "reviewPoint", role: "hall", ko: "리뷰 미션", xp: 10, enabled: true },
    { id: "upsellPoint", role: "hall", ko: "업셀 미션", xp: 10, enabled: true },
    { id: "membershipPoint", role: "hall", ko: "멤버십 미션", xp: 10, enabled: true },
    { id: "recommendedMenuPoint", role: "hall", ko: "추천메뉴 미션", xp: 10, enabled: true },
  ],
  kitchen: specialCleanAreas.map((area) => ({ id: `clean-${area.id}`, areaId: area.id, role: "kitchen", ko: area.ko, xp: area.xp, enabled: true })),
  marketer: [
    { id: "threadPostPoint", role: "marketer", ko: "쓰레드 포스팅", xp: 10, enabled: true },
    { id: "videoPostPoint", role: "marketer", ko: "영상 촬영 및 포스팅", xp: 10, enabled: true },
    { id: "tomorrowPlanPoint", role: "marketer", ko: "내일 마케팅 기획", xp: 10, enabled: true },
    { id: "marketingReportPoint", role: "marketer", ko: "마케팅 성과 보고", xp: 10, enabled: true },
  ],
};

const defaultRankingSettings = [
  { id: "review-award", title: "리뷰왕", role: "hall", missionIds: ["reviewPoint"], enabled: true, monthlyTrophy: true, mark: "⭐" },
  { id: "upsell-award", title: "업셀왕", role: "hall", missionIds: ["upsellPoint", "recommendedMenuPoint"], enabled: true, monthlyTrophy: true, mark: "⚡" },
  { id: "praise-award", title: "칭찬왕", role: "all", missionIds: ["praise"], enabled: true, monthlyTrophy: true, mark: "💬" },
  { id: "cleaning-award", title: "청소왕", role: "kitchen", missionIds: ["kitchen-performance"], enabled: true, monthlyTrophy: true, mark: "✨" },
  { id: "marketing-award", title: "마케팅왕", role: "marketer", missionIds: ["marketer-performance"], enabled: true, monthlyTrophy: true, mark: "📣" },
];

let state = loadState();
let staff = normalizeStaff(state.staff);
let activeLogTab = "personal";
let activeAdminView = adminViewFromHash(window.location.hash) || "today";

function appStorageKey() {
  return window.LeveloveAuth?.stateStorageKey?.(storageKey) || storageKey;
}

const teamKpiDefinitions = {
  hall: [
    {
      label: "별점 유지",
      help: "5점 유지 2점, 4점 이상 1점, 이하 0점",
      options: ["5점 유지 = 2점", "4점 이상 = 1점", "4점 미만 = 0점"],
    },
    {
      label: "리뷰 목표",
      help: "리뷰 5개 이상 2점, 3개 이상 1점, 이하 0점",
      options: ["5개 이상 = 2점", "3개 이상 = 1점", "3개 미만 = 0점"],
    },
    {
      label: "컴플레인 관리",
      help: "없음 2점, 경미 1점, 심각 0점",
      options: ["컴플레인 없음 = 2점", "경미한 컴플레인 = 1점", "심각한 컴플레인 = 0점"],
    },
    {
      label: "매출 목표",
      help: "17M 이상 2점, 13M 이상 1점, 이하 0점",
      options: ["17M 이상 = 2점", "13M 이상 = 1점", "13M 미만 = 0점"],
    },
    {
      label: "위생 상태",
      help: "좋음 2점, 미흡 1점, 문제 0점",
      options: ["위생 좋음 = 2점", "위생 미흡 = 1점", "위생 문제 = 0점"],
    },
  ],
  kitchen: [
    {
      label: "무컴플레인",
      help: "음식 컴플레인 없음 2점, 경미 1점, 심각 0점",
      options: ["컴플레인 없음 = 2점", "경미한 컴플레인 = 1점", "심각한 컴플레인 = 0점"],
    },
    {
      label: "조리 지연 관리",
      help: "안정 2점, 약간 밀림 1점, 심각 0점",
      options: ["조리 안정 = 2점", "약간 밀림 = 1점", "심각한 지연 = 0점"],
    },
    {
      label: "위생 상태",
      help: "좋음 2점, 미흡 1점, 문제 0점",
      options: ["위생 좋음 = 2점", "위생 미흡 = 1점", "위생 문제 = 0점"],
    },
    {
      label: "재료 로스 관리",
      help: "안정 2점, 약간 낭비 1점, 심함 0점",
      options: ["로스 안정 = 2점", "약간 낭비 = 1점", "낭비 심함 = 0점"],
    },
    {
      label: "준비/마감 완성도",
      help: "완벽 2점, 일부 미흡 1점, 문제 0점",
      options: ["완벽 = 2점", "일부 미흡 = 1점", "문제 = 0점"],
    },
  ],
};

const els = {
  referenceMonth: document.querySelector("#referenceMonth"),
  monthlySales: document.querySelector("#monthlySales"),
  teamForm: document.querySelector("#teamForm"),
  teamDate: document.querySelector("#teamDate"),
  teamType: document.querySelector("#teamType"),
  teamReviewCount: document.querySelector("#teamReviewCount"),
  teamClaimZeroDays: document.querySelector("#teamClaimZeroDays"),
  teamSecondaryLabel: document.querySelector("#teamSecondaryLabel"),
  teamSecondaryHelp: document.querySelector("#teamSecondaryHelp"),
  teamItems: [1, 2, 3, 4, 5].map((index) => ({
    label: document.querySelector(`#teamItem${index}Label`),
    select: document.querySelector(`#teamItem${index}`),
    help: document.querySelector(`#teamItem${index}Help`),
  })),
  mvpName: document.querySelector("#mvpName"),
  mvpMeta: document.querySelector("#mvpMeta"),
  hallTeamAverage: document.querySelector("#hallTeamAverage"),
  kitchenTeamAverage: document.querySelector("#kitchenTeamAverage"),
  storeNameDisplay: document.querySelector("#storeNameDisplay"),
  storeMetaDisplay: document.querySelector("#storeMetaDisplay"),
  weeklyRankingList: document.querySelector("#weeklyRankingList"),
  performanceRankingBoard: document.querySelector("#performanceRankingBoard"),
  rankingList: document.querySelector("#rankingList"),
  pendingCheckCount: document.querySelector("#pendingCheckCount"),
  adminViewButtons: [...document.querySelectorAll("[data-admin-view]")],
  approvalNavCount: document.querySelector("#approvalNavCount"),
  approvalNavMeta: document.querySelector("#approvalNavMeta"),
  rankingNavCount: document.querySelector("#rankingNavCount"),
  teamNavCount: document.querySelector("#teamNavCount"),
  logNavCount: document.querySelector("#logNavCount"),
  selfCheckTable: document.querySelector("#selfCheckTable"),
  operationPointForm: document.querySelector("#operationPointForm"),
  operationPointInput: document.querySelector("#operationPointInput"),
  operationPointPreview: document.querySelector("#operationPointPreview"),
  todayCheckHeadline: document.querySelector("#todayCheckHeadline"),
  todayCheckSubline: document.querySelector("#todayCheckSubline"),
  todayCheckList: document.querySelector("#todayCheckList"),
  adminOnboardingPanel: document.querySelector("#adminOnboardingPanel"),
  adminOnboardingForm: document.querySelector("#adminOnboardingForm"),
  onboardingStoreName: document.querySelector("#onboardingStoreName"),
  onboardingIndustry: document.querySelector("#onboardingIndustry"),
  onboardingLanguage: document.querySelector("#onboardingLanguage"),
  onboardingOperationPoints: document.querySelector("#onboardingOperationPoints"),
  onboardingStatus: document.querySelector("#onboardingStatus"),
  onboardingStoreStep: document.querySelector("#onboardingStoreStep"),
  onboardingFocusStep: document.querySelector("#onboardingFocusStep"),
  onboardingStaffStep: document.querySelector("#onboardingStaffStep"),
  personalLogTable: document.querySelector("#personalLogTable"),
  teamLogTable: document.querySelector("#teamLogTable"),
  logTabButtons: [...document.querySelectorAll("[data-log-tab]")],
  personalLogPanel: document.querySelector("#personalLogPanel"),
  teamLogPanel: document.querySelector("#teamLogPanel"),
  testStaffSelect: document.querySelector("#testStaffSelect"),
  testStaffCount: document.querySelector("#testStaffCount"),
  testToolStatus: document.querySelector("#testToolStatus"),
  testTools: document.querySelector(".admin-test-tools"),
  exportBtn: document.querySelector("#exportBtn"),
};

init();

function init() {
  const authResult = window.LeveloveAuth?.requireRole?.(["owner", "admin", "manager"]);
  if (authResult && !authResult.ok) return;
  const today = new Date();
  els.referenceMonth.value = state.referenceMonth || toMonthInput(today);
  els.teamDate.value = toInputDate(today);
  els.monthlySales.value = state.monthlySales || 0;

  updateTeamKpiLabels();

  els.referenceMonth.addEventListener("change", () => {
    state.referenceMonth = els.referenceMonth.value;
    saveState();
    render();
  });
  els.monthlySales.addEventListener("input", () => {
    state.monthlySales = readNumber(els.monthlySales);
    saveState();
    render();
  });
  els.teamType.addEventListener("change", updateTeamKpiLabels);
  els.selfCheckTable.addEventListener("click", handleSelfCheckAction);
  els.operationPointForm?.addEventListener("submit", saveOperationPoints);
  els.adminOnboardingForm?.addEventListener("submit", saveAdminOnboarding);
  els.personalLogTable.addEventListener("click", deletePersonalEntry);
  els.teamLogTable.addEventListener("click", deleteTeamEntry);
  els.testTools?.addEventListener("click", handleTestToolAction);
  els.logTabButtons.forEach((button) => {
    button.addEventListener("click", () => setLogTab(button.dataset.logTab));
  });
  els.adminViewButtons.forEach((button) => {
    button.addEventListener("click", () => setAdminView(button.dataset.adminView, { updateHash: true }));
  });
  window.addEventListener("hashchange", () => {
    const nextView = adminViewFromHash(window.location.hash);
    if (nextView) setAdminView(nextView);
  });
  els.teamForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTeamEntry();
  });
  els.exportBtn.addEventListener("click", exportCsv);

  setLogTab(activeLogTab);
  setAdminView(activeAdminView);
  trackAdminEvent("link_opened", { page: "admin", view: activeAdminView });
  if (importLegacyStaffFromDefaultStore() || importLegacySelfChecksFromDefaultStore() || repairApprovedSelfCheckEntries()) saveState();
  renderAdminOnboarding();
  render();
  syncCloudState();
}

function adminViewFromHash(hash) {
  const value = String(hash || "").replace("#", "");
  const viewMap = {
    approvalPanel: "approval",
    performanceRankingPanel: "ranking",
    logPanel: "logs",
    teamForm: "team",
  };
  if (["today", "approval", "ops", "logs"].includes(value)) return value;
  return viewMap[value] || "";
}

function setAdminView(view, options = {}) {
  const nextView = ["today", "approval", "ops", "logs"].includes(view) ? view : "today";
  activeAdminView = nextView;
  document.body.dataset.adminView = nextView;
  els.adminViewButtons.forEach((button) => {
    const isActive = button.dataset.adminView === nextView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  if (options.updateHash && window.location.hash !== `#${nextView}`) {
    history.replaceState(null, "", `#${nextView}`);
  }
  if (nextView === "approval") {
    trackAdminEvent("manager_review", {
      page: "admin",
      view: "approval",
      dedupeKey: `${toInputDate(new Date())}:manager_review:${window.LeveloveAuth?.currentSession?.()?.userId || "manager"}`,
    });
  }
}

function setLogTab(tab) {
  activeLogTab = tab === "team" ? "team" : "personal";
  els.logTabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.logTab === activeLogTab);
  });
  els.personalLogPanel.classList.toggle("is-hidden", activeLogTab !== "personal");
  els.teamLogPanel.classList.toggle("is-hidden", activeLogTab !== "team");
}

function loadState() {
  const fallback = {
    referenceMonth: toMonthInput(new Date()),
    monthlySales: 500000000,
    staff: defaultStaff,
    bonusSettings: defaultBonusSettings,
    storeSettings: defaultStoreSettings,
    personalEntries: [],
    teamEntries: [],
    selfChecks: [],
    announcements: [],
    analyticsEvents: [],
  };

  try {
    const saved = JSON.parse(localStorage.getItem(appStorageKey()));
    return {
      ...fallback,
      ...saved,
      bonusSettings: normalizeBonusSettings(saved?.bonusSettings),
      storeSettings: normalizeStoreSettings(saved?.storeSettings),
      selfChecks: saved?.selfChecks || [],
      announcements: saved?.announcements || [],
      analyticsEvents: normalizeAnalyticsEvents(saved?.analyticsEvents),
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  state.staff = staff;
  state.analyticsEvents = normalizeAnalyticsEvents(state.analyticsEvents);
  saveStateEverywhere(state);
}

function trackAdminEvent(type, detail = {}) {
  const session = window.LeveloveAuth?.currentSession?.();
  const user = window.LeveloveAuth?.currentUser?.();
  const event = appendAnalyticsEvent(state, type, {
    actorRole: session?.role || user?.role || "manager",
    actorId: session?.userId || user?.id || "",
    actorName: user?.name || "",
    ...detail,
  });
  if (event) saveState();
  return event;
}

async function syncCloudState() {
  try {
    const cloudState = await loadStateFromCloud();
    if (!cloudState) return;
    const localAnalyticsEvents = state.analyticsEvents;
    state = {
      ...state,
      ...cloudState,
      bonusSettings: normalizeBonusSettings(cloudState.bonusSettings),
      storeSettings: normalizeStoreSettings(cloudState.storeSettings),
      selfChecks: cloudState.selfChecks || [],
      announcements: Array.isArray(cloudState.announcements) ? cloudState.announcements : (state.announcements || []),
      analyticsEvents: mergeAnalyticsEvents(localAnalyticsEvents, cloudState.analyticsEvents),
    };
    staff = normalizeStaff(state.staff);
    const repaired = importLegacyStaffFromDefaultStore() || importLegacySelfChecksFromDefaultStore() || repairApprovedSelfCheckEntries();
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
    if (repaired) saveState();
    els.referenceMonth.value = state.referenceMonth || els.referenceMonth.value;
    els.monthlySales.value = state.monthlySales || 0;
    updateTeamKpiLabels();
    renderAdminOnboarding();
    render();
  } catch (error) {
    console.warn(error);
  }
}

function normalizeStaff(savedStaff) {
  const source = Array.isArray(savedStaff) && savedStaff.length ? savedStaff : defaultStaff;
  return source.map((person) => ({
    ...person,
    role: normalizeRole(person.role || person.type),
    workDays: normalizeWorkDays(person.workDays),
    offDays: normalizeOffDays(person.offDays),
    active: person.active !== false,
  }));
}

function normalizeBonusSettings(settings) {
  return { ...defaultBonusSettings, ...(settings || {}) };
}

function normalizeStoreSettings(settings) {
  const performanceItems = normalizePerformanceItems(settings?.performanceItems);
  return {
    ...defaultStoreSettings,
    ...(settings || {}),
    operationPoints: normalizeOperationPoints(settings?.operationPoints),
    dailyOperationPoints: normalizeOptionalOperationPoints(settings?.dailyOperationPoints),
    dailyOperationDate: String(settings?.dailyOperationDate || "").trim(),
    teamChallengeSettings: normalizeTeamChallengeSettings(settings?.teamChallengeSettings),
    questSettings: {
      ...defaultStoreSettings.questSettings,
      ...((settings || {}).questSettings || {}),
    },
    performanceItems,
    rankingSettings: normalizeRankingSettings(settings?.rankingSettings, performanceItems),
  };
}

function importLegacyStaffFromDefaultStore() {
  const currentKey = appStorageKey();
  if (currentKey === storageKey) return false;
  let legacyState;
  try {
    legacyState = JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    legacyState = null;
  }
  const legacyStaff = normalizeStaff(legacyState?.staff);
  const currentIds = new Set(staff.map((person) => person.id));
  const missingStaff = legacyStaff.filter((person) => person.active !== false && !currentIds.has(person.id));
  if (!missingStaff.length) return false;

  staff = normalizeStaff([...staff, ...missingStaff]);
  state.staff = staff;
  return true;
}

function importLegacySelfChecksFromDefaultStore() {
  const currentKey = appStorageKey();
  if (currentKey === storageKey) return false;
  let legacyState;
  try {
    legacyState = JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    legacyState = null;
  }
  const legacyChecks = Array.isArray(legacyState?.selfChecks) ? legacyState.selfChecks : [];
  if (!legacyChecks.length) return false;

  const activeStaffIds = new Set(staff.map((person) => person.id));
  const existingKeys = new Set((state.selfChecks || []).map((entry) => (
    entry.id || `${entry.date}::${entry.staffId}::${entry.status || "pending"}`
  )));
  const movableChecks = legacyChecks.filter((entry) => (
    activeStaffIds.has(entry.staffId) &&
    ["live", "pending"].includes(entry.status) &&
    !existingKeys.has(entry.id || `${entry.date}::${entry.staffId}::${entry.status || "pending"}`)
  ));
  if (!movableChecks.length) return false;

  state.selfChecks = [...(state.selfChecks || []), ...movableChecks];
  legacyState.selfChecks = legacyChecks.filter((entry) => !movableChecks.some((moved) => (
    (moved.id && moved.id === entry.id) ||
    (!moved.id && moved.date === entry.date && moved.staffId === entry.staffId && moved.status === entry.status)
  )));
  try {
    localStorage.setItem(storageKey, JSON.stringify(legacyState));
  } catch (error) {
    console.warn(error);
  }
  return true;
}

function normalizePerformanceItems(value) {
  return {
    hall: normalizePerformanceList(value?.hall, defaultPerformanceItems.hall, "hall"),
    kitchen: normalizePerformanceList(value?.kitchen, defaultPerformanceItems.kitchen, "kitchen"),
    marketer: normalizePerformanceList(value?.marketer, defaultPerformanceItems.marketer, "marketer"),
  };
}

function normalizePerformanceList(list, fallback, role) {
  const source = Array.isArray(list) && list.length ? list : fallback;
  return source
    .map((item, index) => ({
      id: String(item?.id || fallback[index]?.id || `${role}-${index + 1}`).trim(),
      role,
      areaId: String(item?.areaId || fallback[index]?.areaId || "").trim(),
      ko: String(item?.ko || item?.label || item?.name || fallback[index]?.ko || "").trim(),
      xp: Number.parseInt(item?.xp ?? item?.points ?? fallback[index]?.xp ?? 1, 10) || 1,
      enabled: toBoolean(item?.enabled, true),
    }))
    .filter((item) => item.id && item.ko);
}

function normalizeRankingSettings(value, performanceItems = defaultPerformanceItems) {
  const allowedIds = new Set([
    ...Object.values(performanceItems).flat().map((item) => item.id),
    "praise",
    "kitchen-performance",
    "marketer-performance",
  ]);
  const source = Array.isArray(value) && value.length ? value : defaultRankingSettings;
  const normalized = source
    .map((item, index) => {
      const fallback = defaultRankingSettings[index] || defaultRankingSettings[0];
      const missionIds = Array.isArray(item?.missionIds) ? item.missionIds : [item?.missionId || fallback?.missionIds?.[0] || "praise"];
      return {
        id: String(item?.id || fallback?.id || `ranking-${index + 1}`).trim(),
        title: String(item?.title || fallback?.title || "").trim(),
        role: ["all", "hall", "kitchen", "marketer"].includes(item?.role) ? item.role : (fallback?.role || "all"),
        missionIds: missionIds.map((id) => String(id || "").trim()).filter((id) => allowedIds.has(id)).slice(0, 4),
        enabled: toBoolean(item?.enabled, true),
        cheer: String(item?.cheer || fallback?.cheer || "").trim(),
        monthlyTrophy: toBoolean(item?.monthlyTrophy, true),
        mark: String(item?.mark || fallback?.mark || "🏆").trim().slice(0, 4),
      };
    })
    .filter((item) => item.id && item.title && item.missionIds.length);
  return normalized.length ? normalized : defaultRankingSettings.map((item) => ({ ...item, missionIds: [...item.missionIds] }));
}

function normalizeOperationPoints(points) {
  const source = Array.isArray(points) ? points : defaultStoreSettings.operationPoints;
  const normalized = source
    .map((point) => String(point || "").trim())
    .filter(Boolean)
    .slice(0, 6);
  return normalized.length ? normalized : defaultStoreSettings.operationPoints;
}

function normalizeTeamChallengeSettings(value) {
  const fallback = defaultStoreSettings.teamChallengeSettings;
  const target = Number.parseInt(value?.primaryTarget ?? fallback.primaryTarget, 10);
  return {
    enabled: value?.enabled !== false,
    title: String(value?.title || fallback.title).trim(),
    primaryLabel: String(value?.primaryLabel || fallback.primaryLabel).trim(),
    primaryTarget: Number.isFinite(target) ? Math.min(999, Math.max(1, target)) : fallback.primaryTarget,
    secondaryLabel: String(value?.secondaryLabel || fallback.secondaryLabel).trim(),
  };
}

function parseOperationPoints(value) {
  return normalizeOperationPoints(String(value || "").split(/\r?\n/));
}

function normalizeOptionalOperationPoints(points) {
  const source = Array.isArray(points) ? points : [];
  return source
    .map((point) => String(point || "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function parseOptionalOperationPoints(value) {
  return normalizeOptionalOperationPoints(String(value || "").split(/\r?\n/));
}

function effectiveOperationPoints(storeSettings = normalizeStoreSettings(state.storeSettings)) {
  const dailyPoints = normalizeOptionalOperationPoints(storeSettings.dailyOperationPoints);
  const isTodayBriefing = dailyPoints.length > 0 && storeSettings.dailyOperationDate === toInputDate(new Date());
  return isTodayBriefing ? dailyPoints : [];
}

function normalizeRole(role) {
  if (["hall-manager", "hall", "hall-part", "kitchen-manager", "kitchen", "kitchen-part", "marketer"].includes(role)) return role;
  if (role === "manager") return "hall-manager";
  if (role === "주방") return "kitchen";
  if (role === "마케터" || role === "marketing") return "marketer";
  if (role === "파트타임" || role === "홀") return "hall";
  return "hall";
}

function activeStaff() {
  return staff.filter((person) => person.active !== false);
}

function isOffDay(person, date) {
  return Boolean(date && Array.isArray(person.offDays) && person.offDays.includes(date));
}

function isScheduledWorkDay(person, date) {
  if (!person || !date) return false;
  if (isOffDay(person, date)) return false;
  const day = parseLocalDate(date).getDay();
  return normalizeWorkDays(person.workDays).includes(day);
}

function normalizeWorkDays(days) {
  if (!Array.isArray(days) || !days.length) return [...allWorkDays];
  return [...new Set(days.map(Number).filter((day) => day >= 0 && day <= 6))].sort((a, b) => a - b);
}

function normalizeOffDays(days) {
  if (!Array.isArray(days)) return [];
  return [...new Set(days.filter(Boolean))].sort();
}

function updateTeamKpiLabels() {
  if (els.teamType) els.teamType.value = "store";
  const config = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);
  const definitions = [
    { label: `${config.primaryLabel} 수`, help: `이번주 목표 ${config.primaryTarget} 기준으로 직원 화면에 표시` },
    null,
    null,
    null,
    null,
  ];
  els.teamItems.forEach((item, index) => {
    const definition = definitions[index];
    if (!definition) return;
    if (item.label) item.label.textContent = definition.label;
    if (item.help) item.help.textContent = definition.help;
  });
  if (els.teamSecondaryLabel) els.teamSecondaryLabel.textContent = `${config.secondaryLabel} 수`;
  if (els.teamSecondaryHelp) els.teamSecondaryHelp.textContent = `오늘 발생한 ${config.secondaryLabel} 수 입력`;
}

function addTeamEntry() {
  const teamConfig = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);
  const teamId = "store";
  const alreadyRecorded = state.teamEntries.some((entry) => (
    entry.date === els.teamDate.value && (entry.team === teamId || entry.team === els.teamType.value)
  ));
  if (alreadyRecorded) {
    alert("이미 오늘 이 팀의 KPI 기록을 입력했습니다.");
    return;
  }
  const reviewCount = clamp(readNumber(els.teamReviewCount), 0, 999);
  const reviewTarget = teamConfig.primaryTarget;
  const reviewScore = Math.min(2, Math.round((reviewCount / reviewTarget) * 20) / 10);
  const claimCount = clamp(readNumber(els.teamClaimZeroDays), 0, 999);
  const entry = {
    id: crypto.randomUUID(),
    date: els.teamDate.value,
    team: teamId,
    reviewCount,
    reviewTarget,
    primaryLabel: teamConfig.primaryLabel,
    secondaryLabel: teamConfig.secondaryLabel,
    claimCount,
    claimZeroDays: claimCount,
    item1: reviewScore,
    item2: 0,
    item3: 0,
    item4: 0,
    item5: 0,
    memo: document.querySelector("#teamMemo").value.trim(),
  };
  state.teamEntries.push(entry);
  saveState();
  els.teamForm.reset();
  els.teamDate.value = entry.date;
  els.teamType.value = entry.team;
  if (els.teamReviewCount) els.teamReviewCount.value = "0";
  if (els.teamClaimZeroDays) els.teamClaimZeroDays.value = "0";
  updateTeamKpiLabels();
  render();
}

function render() {
  const month = els.referenceMonth.value || toMonthInput(new Date());
  const storeSettings = normalizeStoreSettings(state.storeSettings);
  const personalRows = buildPersonalRows(month);
  const hallTeamAverage = 0;
  const kitchenTeamAverage = 0;
  const bonusRows = personalRows.map((row) => buildBonusRow(row, hallTeamAverage, kitchenTeamAverage));
  const mvp = bonusRows
    .filter((row) => !isManagerRole(row.role))
    .filter((row) => row.performancePoints >= 150 && row.kpiAverage >= 8.5 && row.complaints === 0)
    .sort((a, b) => b.kpiAverage - a.kpiAverage || b.performancePoints - a.performancePoints)[0];

  const teamChallenge = currentWeekTeamChallenge();
  const teamConfig = normalizeTeamChallengeSettings(storeSettings.teamChallengeSettings);
  els.hallTeamAverage.textContent = teamChallenge ? `${teamClaimCount(teamChallenge)}건` : "0건";
  els.kitchenTeamAverage.textContent = teamChallenge
    ? `${Number(teamChallenge.reviewCount || 0)} / ${teamConfig.primaryTarget}`
    : "-";
  els.mvpName.textContent = mvp ? mvp.name : "-";
  els.mvpMeta.textContent = mvp ? `${formatScore(mvp.kpiAverage)} · ${mvp.performancePoints}P` : "MVP 조건 충족자 없음";
  if (els.storeNameDisplay) els.storeNameDisplay.textContent = storeSettings.storeName || "우리 매장";
  if (els.storeMetaDisplay) els.storeMetaDisplay.textContent = `${industryLabel(storeSettings.industry)} · ${templateLabel(storeSettings.template)}`;
  renderOperationPointSettings(storeSettings);
  renderTodayChecklist(storeSettings);
  renderAdminOnboarding();

  renderAdminWorkspaceSummary(month, hallTeamAverage, kitchenTeamAverage);
  renderSelfCheckQueue();
  renderPersonalLog(month);
  renderTeamLog(month);
}

function todayOperationsMetrics(date = toInputDate(new Date())) {
  const activeEmployees = activeStaff().filter((person) => !isManagerRole(person.role));
  const activeEmployeeIds = new Set(activeEmployees.map((person) => person.id));
  const scheduledStaff = activeEmployees.filter((person) => isScheduledWorkDay(person, date));
  const scheduledIds = new Set(scheduledStaff.map((person) => person.id));
  const todayChecks = (state.selfChecks || []).filter((entry) => (
    entry.date === date &&
    activeEmployeeIds.has(entry.staffId) &&
    entry.status !== "rejected"
  ));
  const todayApprovedEntries = (state.personalEntries || []).filter((entry) => (
    entry.date === date &&
    activeEmployeeIds.has(entry.staffId)
  ));
  const checkedInIds = new Set();
  const submittedIds = new Set();
  const approvedIds = new Set();

  todayChecks.forEach((entry) => {
    if (entry.attendance || entry.attendanceTime) checkedInIds.add(entry.staffId);
    if (["pending", "approved"].includes(entry.status)) submittedIds.add(entry.staffId);
    if (entry.status === "approved") approvedIds.add(entry.staffId);
  });
  todayApprovedEntries.forEach((entry) => {
    if (entry.worked || entry.attendanceTime) checkedInIds.add(entry.staffId);
    submittedIds.add(entry.staffId);
    approvedIds.add(entry.staffId);
  });

  const scheduledSubmittedIds = new Set([...submittedIds].filter((staffId) => scheduledIds.has(staffId)));
  return {
    scheduled: scheduledIds.size,
    checkedIn: checkedInIds.size,
    submitted: submittedIds.size,
    approved: approvedIds.size,
    missing: Math.max(0, scheduledIds.size - scheduledSubmittedIds.size),
  };
}

function renderTodayChecklist(storeSettings = normalizeStoreSettings(state.storeSettings)) {
  if (!els.todayCheckList) return;
  const todayKey = toInputDate(new Date());
  const dailyPoints = normalizeOptionalOperationPoints(storeSettings.dailyOperationPoints);
  const hasTodayBriefing = dailyPoints.length > 0 && storeSettings.dailyOperationDate === todayKey;
  const metrics = todayOperationsMetrics(todayKey);
  if (els.todayCheckHeadline) els.todayCheckHeadline.textContent = "오늘 운영 지표";
  if (els.todayCheckSubline) {
    els.todayCheckSubline.textContent = hasTodayBriefing
      ? `브리핑 ${dailyPoints.length}개 등록됨`
      : "브리핑 미등록";
  }
  const items = [
    {
      state: metrics.checkedIn ? "ok" : "warn",
      title: "출근 인원",
      value: `${metrics.checkedIn}명`,
      meta: `예정 ${metrics.scheduled}명`,
    },
    {
      state: metrics.submitted ? "ok" : "warn",
      title: "제출 인원",
      value: `${metrics.submitted}명`,
      meta: "퇴근 제출 기준",
    },
    {
      state: metrics.approved ? "ok" : "warn",
      title: "승인 인원",
      value: `${metrics.approved}명`,
      meta: "매니저 승인 완료",
    },
    {
      state: metrics.missing ? "warn" : "ok",
      title: "미제출 인원",
      value: `${metrics.missing}명`,
      meta: "예정 인원 중 미제출",
    },
  ];
  els.todayCheckList.innerHTML = items.map((item) => `
    <article class="today-check-item today-metric-card is-${escapeHtml(item.state)}">
      <span aria-hidden="true">${item.state === "ok" ? "OK" : item.state === "warn" ? "!" : "-"}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.meta)}</small>
      </div>
      <b>${escapeHtml(item.value)}</b>
    </article>
  `).join("");
}

function renderAdminWorkspaceSummary(month, hallTeamAverage, kitchenTeamAverage) {
  const visibleChecks = (state.selfChecks || []).filter((entry) => entry.status === "pending" || entry.status === "live");
  const pendingCount = visibleChecks.filter((entry) => entry.status === "pending").length;
  const liveCount = visibleChecks.length - pendingCount;
  const personalCount = monthEntries(state.personalEntries || [], month).length;
  const teamCount = monthEntries(state.teamEntries || [], month).length;
  const teamConfig = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);

  if (els.approvalNavCount) els.approvalNavCount.textContent = `${visibleChecks.length}건`;
  if (els.approvalNavMeta) {
    els.approvalNavMeta.textContent = liveCount ? `승인 ${pendingCount} · 진행 ${liveCount}` : `승인 ${pendingCount}`;
  }
  if (els.rankingNavCount) els.rankingNavCount.textContent = `${personalCount}건`;
  const teamChallenge = currentWeekTeamChallenge();
  if (els.teamNavCount) {
    els.teamNavCount.textContent = teamChallenge
      ? `${Number(teamChallenge.reviewCount || 0)} / ${teamConfig.primaryTarget}`
      : `0 / ${teamConfig.primaryTarget}`;
  }
  if (els.logNavCount) els.logNavCount.textContent = `${personalCount + teamCount}건`;
}

function industryLabel(value) {
  const labels = {
    restaurant: "일반 음식점",
    cafe: "카페",
    pub: "술집/포차",
    delivery: "배달 중심 매장",
    franchise: "프랜차이즈",
  };
  return labels[value] || "요식업 매장";
}

function templateLabel(value) {
  const labels = {
    "korean-restaurant": "한국 음식점 기본 템플릿",
    cafe: "카페 템플릿",
    pub: "술집/포차 템플릿",
    delivery: "배달 매장 템플릿",
    custom: "직접 설정",
  };
  return labels[value] || "한국 음식점 기본 템플릿";
}

function renderWeeklyRanking(rows) {
  const ranked = [...rows].sort((a, b) => b.weeklyAverage - a.weeklyAverage || b.workedDays - a.workedDays);
  if (!ranked.some((row) => row.workedDays || row.weeklyAverage)) {
    els.weeklyRankingList.innerHTML = `<div class="empty-state">최근 7일 기록이 없습니다.</div>`;
    return;
  }
  els.weeklyRankingList.innerHTML = ranked.map((row, index) => {
    const visual = getRankVisual(index);
    const rankBadge = index === 0 ? `<span class="badge">TOP 1</span>` : "";
    return `
      <article class="rank-card weekly-rank-card rank-${visual.rank}">
        <div class="avatar rank-avatar rank-avatar-${visual.rank}" aria-hidden="true"></div>
        <div class="rank-main">
          <h3>${index + 1}위 · ${escapeHtml(row.name)}</h3>
          <p>${roleLabel(row.role)} · 최근 7일 ${row.workedDays}일 기록</p>
          <div class="badge-row">
            ${rankBadge}
            <span class="badge">${kpiStatus(row.weeklyAverage)}</span>
          </div>
        </div>
        <div class="rank-score">
          <strong>${formatScore(row.weeklyAverage)}</strong>
        </div>
      </article>
    `;
  }).join("");
}

function renderPerformanceRankings(month) {
  if (!els.performanceRankingBoard) return;
  const entries = monthEntries(state.personalEntries || [], month);
  const boards = [
    {
      title: "리뷰왕",
      meta: "리뷰 등록 수",
      unit: "건",
      rows: buildPerformanceRankingRows(entries, (entry) => Number(entry.reviewPoint || 0) + Number(entry.membershipPoint || 0), (entry) => ({
        review: Number(entry.reviewPoint || 0),
        membership: Number(entry.membershipPoint || 0),
      })),
      detail: (parts) => `리뷰 ${parts.review || 0} · 멤버십 ${parts.membership || 0}`,
    },
    {
      title: "업셀/판매왕",
      meta: "업셀 + 추천메뉴 판매",
      unit: "건",
      rows: buildPerformanceRankingRows(entries, (entry) => Number(entry.upsellPoint || 0) + Number(entry.recommendedMenuPoint || 0), (entry) => ({
        upsell: Number(entry.upsellPoint || 0),
        recommended: Number(entry.recommendedMenuPoint || 0),
      })),
      detail: (parts) => `업셀 ${parts.upsell || 0} · 추천 ${parts.recommended || 0}`,
    },
    {
      title: "칭찬왕",
      meta: "동료에게 받은 칭찬",
      unit: "회",
      rows: buildPraiseRankingRows(entries),
    },
    {
      title: "청소왕",
      meta: "주방 특수 청소 건수",
      unit: "건",
      rows: buildPerformanceRankingRows(
        entries,
        (entry) => isKitchenRole(entry.role) ? Number(entry.hygieneFixPoint || 0) : 0,
        (entry) => isKitchenRole(entry.role) ? ({
          count: Number(entry.hygieneFixPoint || 0),
        }) : {}
      ).filter((row) => isKitchenRole(row.role)),
      detail: (parts) => `청소 ${parts.count || 0}건`,
    },
  ];
  els.performanceRankingBoard.innerHTML = boards.map((board) => `
    <article class="performance-ranking-card">
      <div class="performance-ranking-head">
        <strong>${board.title}</strong>
        <span>${board.meta}</span>
      </div>
      ${renderPerformanceRankingList(board)}
    </article>
  `).join("");
}

function buildPerformanceRankingRows(entries, valueForEntry, detailForEntry = () => ({})) {
  const rows = activeStaff()
    .filter((person) => !isManagerRole(person.role))
    .map((person) => {
      const personEntries = entries.filter((entry) => entry.staffId === person.id);
      const value = personEntries.reduce((sum, entry) => sum + valueForEntry(entry), 0);
      const detail = personEntries.reduce((memo, entry) => {
        const next = detailForEntry(entry);
        Object.entries(next).forEach(([key, count]) => {
          memo[key] = Number(memo[key] || 0) + Number(count || 0);
        });
        return memo;
      }, {});
      return { id: person.id, name: person.name, role: person.role, value, detail };
    });
  return rows.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

function buildPraiseRankingRows(entries) {
  return activeStaff()
    .filter((person) => !isManagerRole(person.role))
    .map((person) => ({
      id: person.id,
      name: person.name,
      role: person.role,
      value: entries.filter((entry) => entry.helpType === person.id).length,
      detail: {},
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

function renderPerformanceRankingList(board) {
  const rows = board.rows.filter((row) => row.value > 0).slice(0, 5);
  if (!rows.length) return `<div class="empty-state compact">아직 이번 달 기록 없음</div>`;
  return `
    <ol class="performance-ranking-list">
      ${rows.map((row, index) => `
        <li>
          <span>${index + 1}</span>
          <div>
            <strong>${escapeHtml(row.name)}</strong>
            <small>${board.detail ? board.detail(row.detail) : roleLabel(row.role)}</small>
          </div>
          <em>${row.value}${board.unit}</em>
        </li>
      `).join("")}
    </ol>
  `;
}

function renderCharacterRanking(rows) {
  const ranked = [...rows].sort((a, b) => b.kpiAverage - a.kpiAverage || b.performancePoints - a.performancePoints || b.totalBonus - a.totalBonus);
  if (!ranked.some((row) => row.workedDays || row.kpiAverage)) {
    els.rankingList.innerHTML = `<div class="empty-state">아직 기록이 없습니다. 개인 KPI를 입력하세요.</div>`;
    return;
  }
  els.rankingList.innerHTML = ranked.map((row, index) => {
    const visual = getRankVisual(index);
    const badges = getRankingBadges(row, index);
    return `
      <article class="rank-card rank-${visual.rank}">
        <div class="avatar rank-avatar rank-avatar-${visual.rank}" aria-hidden="true"></div>
        <div class="rank-main">
          <h3>${index + 1}위 · ${escapeHtml(row.name)}</h3>
          <p>${roleLabel(row.role)} · ${row.status}</p>
          <div class="badge-row">${badges.map((badge) => `<span class="badge">${badge}</span>`).join("")}</div>
          <small class="rank-message">${visual.message}</small>
        </div>
        <div class="rank-score">
          <strong>${formatScore(row.kpiAverage)}</strong>
        </div>
      </article>
    `;
  }).join("");
}

function getRankVisual(index) {
  const rank = Math.min(index + 1, 9);
  const messages = {
    1: "최고 중의 최고!",
    2: "멋져요! 최고의 자리에요!",
    3: "거의 다 왔어요!",
    4: "아주 잘하고 있어요!",
    5: "중간 이상은 하고 있어요!",
    6: "좋아요! 계속 유지해요!",
    7: "점점 좋아지고 있어요!",
    8: "조금만 더 힘내요!",
    9: "아직은 시작 단계!",
  };
  return { rank, message: messages[rank] };
}

function getRankingBadges(row, index) {
  const settings = state.bonusSettings;
  const badges = [];
  if (index === 0) badges.push("TOP 1");
  if (row.kpiAverage >= settings.kpiTopThreshold) badges.push("MVP급");
  else if (row.kpiAverage >= settings.kpiGoodThreshold) badges.push("우수");
  else if (row.kpiAverage >= settings.kpiMinimumThreshold) badges.push("안정");
  if (row.performancePoints >= settings.pointTopThreshold) badges.push("성과 MVP");
  else if (row.performancePoints >= settings.pointGoodThreshold) badges.push("성과 에이스");
  if (!badges.length) badges.push("다음 레벨 도전");
  return badges;
}

function saveOperationPoints(event) {
  event.preventDefault();
  const storeSettings = normalizeStoreSettings(state.storeSettings);
  const dailyOperationPoints = parseOptionalOperationPoints(els.operationPointInput.value);
  state.storeSettings = {
    ...storeSettings,
    dailyOperationPoints,
    dailyOperationDate: dailyOperationPoints.length ? toInputDate(new Date()) : "",
  };
  saveState();
  render();
  alert("오늘 운영 포인트를 저장했습니다. 직원 화면에 반영됩니다.");
}

function saveAdminOnboarding(event) {
  event.preventDefault();
  const storeSettings = normalizeStoreSettings(state.storeSettings);
  const storeName = String(els.onboardingStoreName?.value || "").trim() || storeSettings.storeName;
  const dailyOperationPoints = parseOptionalOperationPoints(els.onboardingOperationPoints?.value || "");
  state.storeSettings = {
    ...storeSettings,
    storeName,
    industry: els.onboardingIndustry?.value || storeSettings.industry,
    template: storeSettings.template || "korean-restaurant",
    defaultLanguage: els.onboardingLanguage?.value || storeSettings.defaultLanguage,
    dailyOperationPoints,
    dailyOperationDate: dailyOperationPoints.length ? toInputDate(new Date()) : "",
    onboardingComplete: true,
    onboardingCompletedAt: new Date().toISOString(),
  };
  saveState();
  renderAdminOnboarding();
  render();
  if (els.onboardingStatus) {
    els.onboardingStatus.textContent = "첫 설정이 저장됐어요. 이제 직원 관리에서 직원 링크를 만들면 됩니다.";
  }
}

function renderAdminOnboarding() {
  if (!els.adminOnboardingPanel) return;
  const storeSettings = normalizeStoreSettings(state.storeSettings);
  const points = normalizeOptionalOperationPoints(storeSettings.dailyOperationPoints);
  if (els.onboardingStoreName && document.activeElement !== els.onboardingStoreName) {
    els.onboardingStoreName.value = storeSettings.storeName || "";
  }
  if (els.onboardingIndustry) els.onboardingIndustry.value = storeSettings.industry || "restaurant";
  if (els.onboardingLanguage) els.onboardingLanguage.value = storeSettings.defaultLanguage || "ko";
  if (els.onboardingOperationPoints && document.activeElement !== els.onboardingOperationPoints) {
    els.onboardingOperationPoints.value = storeSettings.dailyOperationDate === toInputDate(new Date()) ? points.join("\n") : "";
  }
  const hasStore = Boolean(String(storeSettings.storeName || "").trim());
  const hasFocus = points.length > 0;
  const hasStaff = activeStaff().filter((person) => !isManagerRole(person.role)).length > 0;
  els.onboardingStoreStep?.classList.toggle("is-done", hasStore);
  els.onboardingFocusStep?.classList.toggle("is-done", hasFocus);
  els.onboardingStaffStep?.classList.toggle("is-done", hasStaff);
  els.adminOnboardingPanel.classList.toggle("is-complete", Boolean(storeSettings.onboardingComplete));
  if (els.onboardingStatus && document.activeElement !== els.onboardingStatus) {
    els.onboardingStatus.textContent = storeSettings.onboardingComplete
      ? "기본 설정 완료. 필요하면 언제든 여기서 다시 수정할 수 있어요."
      : "저장하면 직원앱과 관리자 요약에 바로 반영돼요.";
  }
}

function renderOperationPointSettings(storeSettings = normalizeStoreSettings(state.storeSettings)) {
  if (!els.operationPointInput || !els.operationPointPreview) return;
  const dailyPoints = normalizeOptionalOperationPoints(storeSettings.dailyOperationPoints);
  const todayKey = toInputDate(new Date());
  const isTodayBriefing = dailyPoints.length > 0 && storeSettings.dailyOperationDate === todayKey;
  const points = isTodayBriefing ? dailyPoints : [];
  if (document.activeElement !== els.operationPointInput) {
    els.operationPointInput.value = isTodayBriefing ? dailyPoints.join("\n") : "";
  }
  const statusText = isTodayBriefing
    ? "\uC624\uB298 \uBE0C\uB9AC\uD551 \uC801\uC6A9\uC911"
    : dailyPoints.length
      ? "\uC9C0\uB09C \uBE0C\uB9AC\uD551\uC774\uB77C \uC9C1\uC6D0\uC571\uC5D0 \uC228\uAE40"
      : "\uC624\uB298 \uC785\uB825\uB41C \uC6B4\uC601 \uD3EC\uC778\uD2B8 \uC5C6\uC74C";
  els.operationPointPreview.innerHTML = [
    `<span>${statusText}</span>`,
    ...points.map((point) => `<span>${escapeHtml(point)}</span>`),
  ].join("");
}
function buildWeeklyRows() {
  const entries = recentEntries(state.personalEntries, 7);
  return activeStaff().filter((person) => !isManagerRole(person.role)).map((person) => {
    const personEntries = entries.filter((entry) => entry.staffId === person.id && entry.worked);
    const scores = personEntries.map((entry) => calculatePersonalDaily(entry, person.role).total);
    return {
      ...person,
      workedDays: personEntries.length,
      weeklyAverage: scores.length ? average(scores) : 0,
    };
  });
}

function buildPersonalRows(month) {
  return activeStaff().map((person) => {
    const entries = monthEntries(state.personalEntries, month).filter((entry) => entry.staffId === person.id && entry.worked);
    const scores = entries.map((entry) => calculatePersonalDaily(entry, person.role));
    const kpiAverage = scores.length ? average(scores.map((score) => score.total)) : 0;
    const performancePoints = entries.reduce((sum, entry) => sum + getPerformancePoints(entry), 0);
    const complaints = entries.reduce((sum, entry) => sum + Number(entry.complaint || 0), 0);
    return {
      ...person,
      entries,
      workedDays: entries.length,
      kpiAverage,
      status: kpiStatus(kpiAverage),
      performancePoints,
      complaints,
    };
  });
}

function calculatePersonalDaily(entry, role) {
  if (!entry.worked) return { total: 0, plus: 0, minus: 0, baseMinus: 0, missed: 0 };
  if (isMarketerRole(role)) {
    const baseMinus = Number(entry.late || 0)
      + Number(entry.orderMiss || 0)
      + Number(entry.posMistake || 0)
      + Number(entry.unkind || 0)
      + Number(entry.complaint || 0) * 2
      + Number(entry.attitudeIssue || 0)
      + Number(entry.phoneOveruse || 0)
      + Number(entry.handoffMiss || 0)
      + Number(entry.cookDelay || 0)
      + Number(entry.waste || 0);
    return { total: clamp(10 - baseMinus, 0, 10), plus: 0, minus: baseMinus, baseMinus, missed: 0 };
  }
  const isKitchen = isKitchenRole(role);
  const baseMinus = isKitchen
    ? Number(entry.complaint || 0) * 2 + Number(entry.cookDelay || 0) * 2 + Number(entry.waste || 0) + Number(entry.hygieneIssue || 0) + Number(entry.attitudeIssue || 0) + Number(entry.orderMiss || 0) + Number(entry.late || 0) + Number(entry.phoneOveruse || 0)
    : Number(entry.late || 0) + Number(entry.orderMiss || 0) + Number(entry.posMistake || 0) + Number(entry.unkind || 0) + Number(entry.complaint || 0) * 2 + Number(entry.attitudeIssue || 0) + Number(entry.phoneOveruse || 0) + Number(entry.handoffMiss || 0);
  const missed = isKitchen
    ? 0
    : Number(entry.membershipLead || 0) + Number(entry.reviewRequest || 0) + Number(entry.upsellLead || 0);
  const minus = baseMinus + missed;
  return { total: clamp(10 - minus, 0, 10), plus: 0, minus, baseMinus, missed };
}

function getPerformancePoints(entry) {
  return (Number(entry.reviewPoint || 0) * 10)
    + (Number(entry.upsellPoint || 0) * 10)
    + (Number(entry.membershipPoint || 0) * 10)
    + (Number(entry.recommendedMenuPoint || 0) * 10)
    + Number(entry.praisePoint || 0)
    + specialCleanXpFromEntry(entry)
    + (Number(entry.threadPostPoint || 0) * 10)
    + (Number(entry.videoPostPoint || 0) * 10)
    + (Number(entry.tomorrowPlanPoint || 0) * 10)
    + (Number(entry.marketingReportPoint || 0) * 10);
}

function specialCleanOption(id) {
  return specialCleanAreas.find((area) => area.id === id);
}

function specialCleanLabel(entry) {
  return specialCleanOption(entry?.specialCleanArea)?.ko || "특수 청소 완료";
}

function specialCleanXpFromEntry(entry) {
  const reportXp = (Array.isArray(entry?.performanceReports) ? entry.performanceReports : [])
    .filter((report) => report.role === "kitchen")
    .reduce((sum, report) => sum + Number(report.count || 0) * performanceReportXpValue(report), 0);
  if (reportXp > 0) return reportXp;
  const count = Number(entry?.hygieneFixPoint || 0);
  if (!count) return 0;
  return count * 10;
}

function performanceXpFromEntry(entry) {
  const reports = Array.isArray(entry?.performanceReports) ? entry.performanceReports : [];
  if (reports.length) {
    return reports.reduce((sum, report) => sum + Number(report.count || 0) * performanceReportXpValue(report), 0);
  }
  return (Number(entry.reviewPoint || 0) * 10)
    + (Number(entry.upsellPoint || 0) * 10)
    + (Number(entry.membershipPoint || 0) * 10)
    + (Number(entry.recommendedMenuPoint || 0) * 10)
    + specialCleanXpFromEntry(entry)
    + (Number(entry.threadPostPoint || 0) * 10)
    + (Number(entry.videoPostPoint || 0) * 10)
    + (Number(entry.tomorrowPlanPoint || 0) * 10)
    + (Number(entry.marketingReportPoint || 0) * 10);
}

function performanceReportXpValue(report) {
  return ["kitchen", "marketer"].includes(report?.role) ? 10 : Number(report?.xp || 1);
}

function normalizeApprovedPerformanceReports(entry) {
  return (Array.isArray(entry?.performanceReports) ? entry.performanceReports : [])
    .map((report) => ({
      id: String(report?.id || "").trim(),
      role: normalizeRole(report?.role || entry?.role || "hall"),
      areaId: String(report?.areaId || "").trim(),
      label: String(report?.label || "").trim(),
      xp: Number(report?.xp || 10),
      count: Number(report?.count || 0),
    }))
    .filter((report) => report.id && report.count > 0);
}

function approvedPerformanceCount(entry, reportIds = [], legacyKeys = []) {
  const ids = new Set(reportIds);
  const reportCount = normalizeApprovedPerformanceReports(entry)
    .filter((report) => ids.has(report.id))
    .reduce((sum, report) => sum + Number(report.count || 0), 0);
  if (reportCount > 0) return reportCount;
  return legacyKeys.reduce((sum, key) => sum + Number(entry?.[key] || 0), 0);
}

function repairApprovedSelfCheckEntries() {
  let changed = false;
  const approvedChecks = (state.selfChecks || []).filter((entry) => entry.status === "approved");
  approvedChecks.forEach((selfCheck) => {
    const entry = (state.personalEntries || []).find((candidate) => (
      candidate.sourceSelfCheckId === selfCheck.id ||
      (candidate.source === "self-check" && candidate.date === selfCheck.date && candidate.staffId === selfCheck.staffId)
    ));
    if (!entry) return;

    const performanceReports = normalizeApprovedPerformanceReports(selfCheck);
    const performanceSource = { ...selfCheck, performanceReports };
    const firstKitchenReport = performanceReports.find((report) => report.role === "kitchen");
    const patches = {
      performanceReports,
      reviewPoint: approvedPerformanceCount(performanceSource, ["reviewPoint", "review-photo"], ["reviewPoint"]),
      upsellPoint: approvedPerformanceCount(performanceSource, ["upsellPoint", "sales-xp"], ["upsellPoint"]),
      membershipPoint: approvedPerformanceCount(performanceSource, ["membershipPoint"], ["membershipPoint"]),
      recommendedMenuPoint: approvedPerformanceCount(performanceSource, ["recommendedMenuPoint"], ["recommendedMenuPoint"]),
      hygieneFixPoint: specialCleanCountFromEntry(performanceSource),
      specialCleanArea: selfCheck.specialCleanArea || firstKitchenReport?.areaId || firstKitchenReport?.id || "",
      specialCleanXp: specialCleanXpFromEntry(performanceSource),
      threadPostPoint: approvedPerformanceCount(performanceSource, ["threadPostPoint", "thread-post"], ["threadPostPoint"]),
      videoPostPoint: approvedPerformanceCount(performanceSource, ["videoPostPoint", "video-post"], ["videoPostPoint"]),
      tomorrowPlanPoint: approvedPerformanceCount(performanceSource, ["tomorrowPlanPoint", "tomorrow-plan"], ["tomorrowPlanPoint"]),
      marketingReportPoint: approvedPerformanceCount(performanceSource, ["marketingReportPoint", "marketing-report"], ["marketingReportPoint"]),
    };

    if (performanceReports.length && !Array.isArray(entry.performanceReports)) {
      entry.performanceReports = performanceReports;
      changed = true;
    } else if (performanceReports.length && !entry.performanceReports.length) {
      entry.performanceReports = performanceReports;
      changed = true;
    }

    Object.entries(patches).forEach(([key, value]) => {
      if (key === "performanceReports" || value === "" || value === 0) return;
      if (!entry[key] || Number(entry[key] || 0) === 0) {
        entry[key] = value;
        changed = true;
      }
    });
    const approvedXp = calculateSelfCheckApprovedXp(performanceSource);
    if (approvedXp && Number(entry.approvedXp || 0) !== approvedXp) {
      entry.approvedXp = approvedXp;
      changed = true;
    }
  });
  return changed;
}

function calculateSelfCheckApprovedXp(selfCheck) {
  if (!Number(selfCheck.attendance || 0)) return 0;
  let xp = 10;
  if (selfCheck.goalChecked || selfCheck.goalType) xp += 10;
  if (selfCheck.cleaningDone || selfCheck.cleanArea || selfCheck.cleanStatus) xp += 10;
  xp += (Number(selfCheck.helpCount || 0) > 0 || selfCheck.helpType) ? 10 : 0;
  xp += performanceXpFromEntry(selfCheck);
  return xp;
}

function estimateApprovedXp(entry) {
  if (!Number(entry.worked || 0)) return 0;
  let xp = 10;
  xp += Number(entry.teamHelp || 0) ? 10 : 0;
  xp += performanceXpFromEntry(entry);
  return xp;
}

function renderSelfCheckQueue() {
  const rows = (state.selfChecks || [])
    .filter((entry) => entry.status === "pending" || entry.status === "live")
    .sort((a, b) => `${b.date}${b.updatedAt || b.createdAt || ""}`.localeCompare(`${a.date}${a.updatedAt || a.createdAt || ""}`));

  const pendingRows = rows.filter((entry) => entry.status === "pending");
  const liveRows = rows.filter((entry) => entry.status === "live");
  els.pendingCheckCount.textContent = liveRows.length
    ? `대기 ${pendingRows.length}건 · 진행중 ${liveRows.length}건`
    : `대기 ${pendingRows.length}건`;
  if (!rows.length) {
    els.selfCheckTable.innerHTML = `<tr class="approval-card-row"><td colspan="7"><div class="approval-empty">진행중 또는 승인 대기 기록 없음</div></td></tr>`;
    return;
  }

  els.selfCheckTable.innerHTML = rows.map((entry) => {
    const person = staff.find((item) => item.id === entry.staffId);
    const displayName = person?.name || entry.staffName || entry.staffId;
    const role = person?.role || entry.role;
    const points = getPerformancePoints(entry);
    const missionChips = renderApprovalMissionChips(entry);
    const rankingImpact = renderApprovalRankingImpact(entry, role);
    return `
      <tr class="approval-card-row">
        <td colspan="7">
          <article class="approval-card">
            <div class="approval-main">
              <span class="approval-date">${entry.date}</span>
              <div>
                <strong>${escapeHtml(displayName)}</strong>
                <small>${escapeHtml(entry.roleName || roleLabel(role))}</small>
              </div>
              <div>
                <span class="approval-label">체크 내용</span>
                <p>${escapeHtml(selfCheckSummary(entry))}</p>
                ${missionChips}
              </div>
              <div class="approval-points">
                <span class="approval-label">성과P</span>
                <strong>${points}P</strong>
              </div>
              <div class="approval-photos">
                <span class="approval-label">사진</span>
                ${renderSelfCheckPhoto(entry)}
              </div>
            </div>
            ${rankingImpact}
            <div class="approval-review">
              <div>
                <span class="approval-label">매니저 감점</span>
                ${renderApprovalPenaltyControls(entry.id, role)}
              </div>
              <div class="action-cell">${entry.status === "pending" ? `
                <button class="btn primary mini-btn" type="button" data-approve-check="${entry.id}">승인</button>
                <button class="btn danger mini-btn" type="button" data-reject-check="${entry.id}">반려</button>
                <button class="btn ghost mini-btn" type="button" data-delete-check="${entry.id}">삭제</button>
              ` : `
                <span class="pill">진행중</span>
                <small>퇴근 전 점검 제출 대기</small>
                <button class="btn primary mini-btn" type="button" data-submit-live-check="${entry.id}">제출 처리</button>
                <button class="btn danger mini-btn" type="button" data-reject-check="${entry.id}">반려</button>
                <button class="btn ghost mini-btn" type="button" data-delete-check="${entry.id}">삭제</button>
              `}</div>
            </div>
          </article>
        </td>
      </tr>
    `;
  }).join("");
}

function renderApprovalMissionChips(entry) {
  const missions = approvalMissionItems(entry);
  if (!missions.length) return "";
  return `
    <div class="approval-mission-chips" aria-label="제출 성과 미션">
      ${missions.map((mission) => `
        <span>
          <b>${escapeHtml(mission.label)}</b>
          <small>성과P +${Number(mission.points || 0).toLocaleString()}</small>
        </span>
      `).join("")}
    </div>
  `;
}

function renderApprovalRankingImpact(entry, role) {
  const impacts = approvalRankingImpacts(entry, role);
  if (!impacts.length) {
    return `
      <div class="approval-ranking-impact is-empty">
        <span class="approval-label">랭킹 영향</span>
        <p>이번 제출로 변동되는 랭킹 없음</p>
      </div>
    `;
  }
  return `
    <div class="approval-ranking-impact">
      <div>
        <span class="approval-label">랭킹/트로피 영향</span>
        <strong>승인하면 아래 랭킹에 바로 반영돼요</strong>
      </div>
      <div class="approval-impact-chips">
        ${impacts.map((impact) => `
          <span>
            <b>${escapeHtml(impact.mark)} ${escapeHtml(impact.title)}</b>
            <small>+${Number(impact.value || 0).toLocaleString()}건 · ${impact.monthlyTrophy ? "월간 트로피" : "랭킹만"}</small>
          </span>
        `).join("")}
      </div>
    </div>
  `;
}

function approvalMissionItems(entry) {
  const reports = Array.isArray(entry?.performanceReports) ? entry.performanceReports : [];
  if (reports.length) {
    return reports
      .filter((report) => Number(report.count || 0) > 0)
      .map((report) => ({
        id: report.id,
        label: report.label || performanceItemLabel(performanceItemById(report.id)) || report.id,
        points: Number(report.count || 0) * performanceReportXpValue(report),
      }));
  }
  return allPerformanceItems()
    .map((item) => {
      const count = performanceCountFromEntry(entry, item.id);
      if (count <= 0) return null;
      return {
        id: item.id,
        label: performanceItemLabel(item),
        points: count * Number(item.xp || 1),
      };
    })
    .filter(Boolean);
}

function approvalRankingImpacts(entry, role) {
  return configuredRankingSettings()
    .filter((ranking) => rankingAppliesToRole(ranking, role))
    .map((ranking) => ({
      ...ranking,
      value: rankingValueForEntry(ranking, entry),
    }))
    .filter((ranking) => ranking.value > 0);
}

function configuredRankingSettings() {
  return normalizeRankingSettings(state.storeSettings?.rankingSettings, normalizePerformanceItems(state.storeSettings?.performanceItems))
    .filter((item) => item.enabled !== false);
}

function rankingAppliesToRole(ranking, role) {
  if (!ranking) return false;
  if (ranking.role === "all") return true;
  if (ranking.role === "hall") return isHallRole(role);
  if (ranking.role === "kitchen") return isKitchenRole(role);
  if (ranking.role === "marketer") return isMarketerRole(role);
  return false;
}

function rankingValueForEntry(ranking, entry) {
  const missionIds = new Set(ranking?.missionIds || []);
  let total = 0;
  if (missionIds.has("praise") && entry?.helpType) total += 1;
  if (missionIds.has("kitchen-performance")) total += specialCleanCountFromEntry(entry);
  if (missionIds.has("marketer-performance")) {
    performanceItemsForRole("marketer").forEach((item) => {
      total += performanceCountFromEntry(entry, item.id);
    });
  }
  [...missionIds]
    .filter((id) => !["praise", "kitchen-performance", "marketer-performance"].includes(id))
    .forEach((id) => {
      total += performanceCountFromEntry(entry, id);
    });
  return total;
}

function performanceCountFromEntry(entry, itemId) {
  const reports = Array.isArray(entry?.performanceReports) ? entry.performanceReports : [];
  const reportCount = reports
    .filter((report) => report.id === itemId)
    .reduce((sum, report) => sum + Number(report.count || 0), 0);
  if (reportCount > 0) return reportCount;
  const legacyMissionKeys = {
    "review-photo": ["reviewPoint", "membershipPoint"],
    "sales-xp": ["upsellPoint", "recommendedMenuPoint"],
    "team-help": ["helpCount"],
    "thread-post": ["threadPostPoint"],
    "video-post": ["videoPostPoint"],
    "tomorrow-plan": ["tomorrowPlanPoint"],
    "marketing-report": ["marketingReportPoint"],
  };
  if (legacyMissionKeys[itemId]) {
    return legacyMissionKeys[itemId].reduce((sum, key) => sum + Number(entry?.[key] || 0), 0);
  }
  if (itemId === "reviewPoint") return Number(entry?.reviewPoint || 0) + Number(entry?.membershipPoint || 0);
  if (itemId === "upsellPoint") return Number(entry?.upsellPoint || 0);
  if (itemId === "membershipPoint") return Number(entry?.membershipPoint || 0);
  if (itemId === "recommendedMenuPoint") return Number(entry?.recommendedMenuPoint || 0);
  if (["threadPostPoint", "videoPostPoint", "tomorrowPlanPoint", "marketingReportPoint"].includes(itemId)) return Number(entry?.[itemId] || 0);
  const item = performanceItemById(itemId);
  if (item?.role === "kitchen" && (item.areaId === entry?.specialCleanArea || item.id === entry?.specialCleanArea)) {
    return Number(entry?.hygieneFixPoint || 0) > 0 ? 1 : 0;
  }
  return Number(entry?.[itemId] || 0);
}

function specialCleanCountFromEntry(entry) {
  const reportCount = (Array.isArray(entry?.performanceReports) ? entry.performanceReports : [])
    .filter((report) => report.role === "kitchen")
    .reduce((sum, report) => sum + Number(report.count || 0), 0);
  if (reportCount > 0) return reportCount;
  return Number(entry?.hygieneFixPoint || 0) > 0 ? Number(entry.hygieneFixPoint || 0) : 0;
}

function performanceItemsForRole(role) {
  const items = normalizePerformanceItems(state.storeSettings?.performanceItems);
  if (role === "kitchen") return items.kitchen;
  if (role === "marketer") return items.marketer;
  return items.hall;
}

function allPerformanceItems() {
  const items = normalizePerformanceItems(state.storeSettings?.performanceItems);
  return [...items.hall, ...items.kitchen, ...items.marketer];
}

function performanceItemById(id) {
  return allPerformanceItems().find((item) => item.id === id);
}

function performanceItemLabel(item) {
  return item?.ko || item?.label || item?.id || "";
}

function renderApprovalPenaltyControls(entryId, role) {
  const marketerPenalties = [
    ["late", "업무 시작/제출 지연"],
    ["orderMiss", "콘텐츠 누락"],
    ["posMistake", "오탈자/링크 오류"],
    ["unkind", "소통 불친절"],
    ["complaint", "브랜드/콘텐츠 클레임"],
    ["attitudeIssue", "보고 태도 문제"],
    ["phoneOveruse", "업무 중 사적 폰 사용"],
    ["handoffMiss", "전달/공유 누락"],
    ["cookDelay", "일정 지연"],
    ["waste", "자료/파일 정리 미흡"],
  ];
  const hallPenalties = [
    ["late", "지각"],
    ["orderMiss", "주문 누락"],
    ["posMistake", "POS 실수"],
    ["unkind", "불친절"],
    ["complaint", "컴플레인"],
    ["attitudeIssue", "태도/협업"],
    ["phoneOveruse", "핸드폰"],
    ["handoffMiss", "전달 누락"],
    ["upsellLead", "업셀링 유도 안함"],
    ["membershipLead", "멤버십 유도 안함"],
    ["reviewRequest", "리뷰 유도 안함"],
  ];
  const kitchenPenalties = [
    ["complaint", "음식 컴플레인"],
    ["cookDelay", "조리 지연"],
    ["waste", "재료 낭비"],
    ["hygieneIssue", "위생 문제"],
    ["attitudeIssue", "협업 문제"],
    ["orderMiss", "주문 누락"],
    ["late", "지각"],
    ["phoneOveruse", "핸드폰"],
  ];
  const penalties = isMarketerRole(role) ? marketerPenalties : isKitchenRole(role) ? kitchenPenalties : hallPenalties;
  return `
    <div class="approval-penalties">
      ${penalties.map(([key, label]) => `
        <label>
          <input type="checkbox" data-approval-penalty="${entryId}:${key}" />
          <span>${label}</span>
        </label>
      `).join("")}
    </div>
  `;
}

function renderSelfCheckPhoto(entry) {
  const photos = normalizeSelfCheckPhotos(entry);
  if (photos.length) {
    return `<div class="approval-photo-grid">${photos.map((photo, index) => `
      <a class="photo-thumb-link" href="${photo.dataUrl}" target="_blank" rel="noopener" download="${escapeHtml(photo.name || `review-photo-${index + 1}.jpg`)}" title="사진 크게 보기">
        <img class="approval-photo" src="${photo.dataUrl}" alt="${escapeHtml(photo.name || "인증 사진")}" />
      </a>
    `).join("")}</div>`;
  }
  return escapeHtml(entry.photoName || "-");
}

function normalizeSelfCheckPhotos(entry) {
  const photos = [];
  if (Array.isArray(entry?.photos)) {
    entry.photos.forEach((photo, index) => {
      if (typeof photo === "string" && photo) {
        photos.push({ name: entry.photoName || `review-photo-${index + 1}.jpg`, dataUrl: normalizePhotoDataUrl(photo) });
        return;
      }
      const dataUrl = photo?.dataUrl || photo?.dataURL || photo?.url || photo?.src || photo?.base64 || "";
      if (dataUrl) {
        photos.push({ ...photo, name: photo?.name || entry.photoName || `review-photo-${index + 1}.jpg`, dataUrl: normalizePhotoDataUrl(dataUrl) });
      }
    });
  }
  if (photos.length) {
    return photos;
  }
  const legacyPhoto = entry?.photoDataUrl || entry?.photoDataURL || entry?.photoUrl || "";
  if (legacyPhoto) {
    return [{ name: entry.photoName || "review-photo.jpg", dataUrl: normalizePhotoDataUrl(legacyPhoto) }];
  }
  return [];
}

function normalizePhotoDataUrl(value) {
  const text = String(value || "");
  if (!text) return "";
  if (text.startsWith("data:image/")) return text;
  if (/^[A-Za-z0-9+/]+=*$/.test(text) && text.length > 100) return `data:image/jpeg;base64,${text}`;
  return text;
}

function selfCheckSummary(entry) {
  const items = [];
  if (entry.attendance) items.push(entry.attendanceTime ? `출근 ${entry.attendanceTime}` : "출근");
  if (entry.checkoutTime) items.push(`퇴근 ${entry.checkoutTime}`);
  if (entry.cleaningDone) {
    const cleanDetail = [entry.cleanArea, entry.cleanStatus].filter(Boolean).join(" · ");
    items.push(cleanDetail ? `퇴근 전 점검(${cleanDetail})` : "퇴근 전 점검");
  }
  if (entry.goalChecked) items.push("운영 포인트 확인");
  const helpCount = Number(entry.helpCount || (entry.helpType ? 1 : 0));
  if (helpCount) {
    const helpLabel = praiseTargetLabel(entry.helpType);
    const helpParts = [helpLabel, praiseReasonLabel(entry.helpReason), entry.helpNote].filter(Boolean);
    items.push(helpParts.join(": "));
  }
  const kitchenContributions = [
    [entry.hygieneFixPoint, entry.specialCleanArea ? `특수 청소 완료(${specialCleanLabel(entry)})` : "특수 청소 완료"],
  ]
    .filter(([count]) => Number(count || 0) > 0)
    .map(([count, label]) => `${label} ${Number(count)}건`);
  const marketerContributions = [
    [entry.threadPostPoint, "쓰레드 포스팅"],
    [entry.videoPostPoint, "영상 촬영 및 포스팅"],
    [entry.tomorrowPlanPoint, "내일 마케팅 기획"],
    [entry.marketingReportPoint, "마케팅 성과 보고"],
  ]
    .filter(([count]) => Number(count || 0) > 0)
    .map(([count, label]) => `${label} ${Number(count)}건`);
  if (kitchenContributions.length) items.push(kitchenContributions.join(" · "));
  if (marketerContributions.length) items.push(marketerContributions.join(" · "));
  if (entry.note) items.push(entry.note);
  return items.join(" · ") || "-";
}

function praiseTargetLabel(value) {
  const person = staff.find((item) => item.id === value);
  if (person) return `${person.name} 칭찬`;
  return value || "팀워크 칭찬";
}

function praiseReasonLabel(value) {
  const labels = {
    peak: "피크타임 지원",
    cleaning: "정리/청소 지원",
    service: "홀/주방 흐름 지원",
    problem: "문제 해결 지원",
    mood: "좋은 분위기",
  };
  return labels[value] || value || "";
}

function handleSelfCheckAction(event) {
  const approveId = event.target.dataset.approveCheck;
  const rejectId = event.target.dataset.rejectCheck;
  const submitLiveId = event.target.dataset.submitLiveCheck;
  const deleteId = event.target.dataset.deleteCheck;
  if (approveId) approveSelfCheck(approveId);
  if (rejectId) rejectSelfCheck(rejectId);
  if (submitLiveId) submitLiveSelfCheck(submitLiveId);
  if (deleteId) deleteSelfCheck(deleteId);
}

function submitLiveSelfCheck(entryId) {
  const selfCheck = (state.selfChecks || []).find((entry) => entry.id === entryId);
  if (!selfCheck) return;
  if (selfCheck.status !== "live") {
    alert("이미 제출됐거나 처리된 기록입니다.");
    return;
  }
  const checkoutTimeInput = prompt("퇴근시간을 입력해주세요. 예: 22:30\n비워두면 퇴근시간 없이 승인 대기로 넘깁니다.", selfCheck.checkoutTime || "");
  if (checkoutTimeInput === null) return;
  const checkoutTimeValue = checkoutTimeInput.trim();
  if (checkoutTimeValue && !/^([01]\d|2[0-3]):[0-5]\d$/.test(checkoutTimeValue)) {
    alert("퇴근시간은 22:30처럼 HH:MM 형식으로 입력해주세요.");
    return;
  }
  selfCheck.status = "pending";
  selfCheck.checkoutTime = checkoutTimeValue;
  selfCheck.submittedAt = new Date().toISOString();
  selfCheck.updatedAt = new Date().toISOString();
  appendAnalyticsEvent(state, "manager_review", {
    actorRole: "manager",
    entryId: selfCheck.id,
    staffId: selfCheck.staffId,
    staffName: selfCheck.staffName || "",
    date: selfCheck.date,
    action: "submit_live_check",
  });
  saveState();
  render();
}

function approveSelfCheck(entryId) {
  const selfCheck = (state.selfChecks || []).find((entry) => entry.id === entryId);
  if (!selfCheck) return;
  if (selfCheck.status !== "pending") {
    alert("직원이 퇴근 전 점검을 제출한 뒤 승인할 수 있습니다.");
    return;
  }
  const person = staff.find((item) => item.id === selfCheck.staffId);
  const alreadyRecorded = state.personalEntries.some((entry) => (
    entry.date === selfCheck.date && entry.staffId === selfCheck.staffId
  ));
  if (alreadyRecorded) {
    alert("이미 이 날짜의 개인 KPI 기록이 있습니다. 기존 기록을 확인한 뒤 처리해주세요.");
    return;
  }

  const role = person?.role || selfCheck.role;
  const isKitchen = isKitchenRole(role);
  const reviewPhotos = normalizeSelfCheckPhotos(selfCheck);
  const performanceReports = normalizeApprovedPerformanceReports(selfCheck);
  const performanceSource = { ...selfCheck, performanceReports };
  const firstKitchenReport = performanceReports.find((report) => report.role === "kitchen");
  const entry = {
    id: crypto.randomUUID(),
    date: selfCheck.date,
    staffId: selfCheck.staffId,
    staffName: person?.name || selfCheck.staffName || selfCheck.staffId,
    role,
    worked: Number(selfCheck.attendance || 0),
    attendanceTime: selfCheck.attendanceTime || "",
    checkoutTime: selfCheck.checkoutTime || "",
    late: readApprovalPenalty(entryId, "late"),
    orderMiss: readApprovalPenalty(entryId, "orderMiss"),
    posMistake: readApprovalPenalty(entryId, "posMistake"),
    unkind: readApprovalPenalty(entryId, "unkind"),
    complaint: readApprovalPenalty(entryId, "complaint"),
    attitudeIssue: readApprovalPenalty(entryId, "attitudeIssue"),
    phoneOveruse: readApprovalPenalty(entryId, "phoneOveruse"),
    handoffMiss: readApprovalPenalty(entryId, "handoffMiss"),
    cookDelay: readApprovalPenalty(entryId, "cookDelay"),
    waste: readApprovalPenalty(entryId, "waste"),
    hygieneIssue: readApprovalPenalty(entryId, "hygieneIssue"),
    membershipLead: readApprovalPenalty(entryId, "membershipLead"),
    teamHelp: Number(selfCheck.helpCount || 0) || selfCheck.helpType ? 0 : 1,
    reviewRequest: readApprovalPenalty(entryId, "reviewRequest"),
    upsellLead: readApprovalPenalty(entryId, "upsellLead"),
    peakStable: 0,
    hygieneGood: isKitchen && !selfCheck.cleaningDone ? 1 : 0,
    stockGood: 0,
    performanceReports,
    upsellPoint: approvedPerformanceCount(performanceSource, ["upsellPoint", "sales-xp"], ["upsellPoint"]),
    membershipPoint: approvedPerformanceCount(performanceSource, ["membershipPoint"], ["membershipPoint"]),
    reviewPoint: approvedPerformanceCount(performanceSource, ["reviewPoint", "review-photo"], ["reviewPoint"]),
    praisePoint: 0,
    recommendedMenuPoint: approvedPerformanceCount(performanceSource, ["recommendedMenuPoint"], ["recommendedMenuPoint"]),
    hygieneFixPoint: specialCleanCountFromEntry(performanceSource),
    specialCleanArea: selfCheck.specialCleanArea || firstKitchenReport?.areaId || firstKitchenReport?.id || "",
    specialCleanXp: specialCleanXpFromEntry(performanceSource),
    threadPostPoint: approvedPerformanceCount(performanceSource, ["threadPostPoint", "thread-post"], ["threadPostPoint"]),
    videoPostPoint: approvedPerformanceCount(performanceSource, ["videoPostPoint", "video-post"], ["videoPostPoint"]),
    tomorrowPlanPoint: approvedPerformanceCount(performanceSource, ["tomorrowPlanPoint", "tomorrow-plan"], ["tomorrowPlanPoint"]),
    marketingReportPoint: approvedPerformanceCount(performanceSource, ["marketingReportPoint", "marketing-report"], ["marketingReportPoint"]),
    approvedXp: calculateSelfCheckApprovedXp(performanceSource),
    source: "self-check",
    sourceSelfCheckId: selfCheck.id,
    helpCount: Number(selfCheck.helpCount || 0),
    helpType: selfCheck.helpType || "",
    helpReason: selfCheck.helpReason || "",
    helpNote: selfCheck.helpNote || "",
    photos: reviewPhotos,
    photoName: selfCheck.photoName || reviewPhotos[0]?.name || "",
    photoDataUrl: selfCheck.photoDataUrl || reviewPhotos[0]?.dataUrl || "",
    memo: [
      selfCheck.cleanArea,
      selfCheck.cleanStatus,
      selfCheck.specialCleanArea ? `특수 청소: ${specialCleanLabel(selfCheck)} ${specialCleanXpFromEntry(selfCheck)}XP` : "",
      selfCheck.threadPostPoint ? `쓰레드 포스팅 ${Number(selfCheck.threadPostPoint)}건` : "",
      selfCheck.videoPostPoint ? `영상 촬영/포스팅 ${Number(selfCheck.videoPostPoint)}건` : "",
      selfCheck.tomorrowPlanPoint ? `내일 마케팅 기획 ${Number(selfCheck.tomorrowPlanPoint)}건` : "",
      selfCheck.marketingReportPoint ? `마케팅 성과 보고 ${Number(selfCheck.marketingReportPoint)}건` : "",
      selfCheck.goalType,
      selfCheck.helpType ? praiseTargetLabel(selfCheck.helpType) : "",
      selfCheck.helpReason ? praiseReasonLabel(selfCheck.helpReason) : "",
      selfCheck.helpNote,
      selfCheck.note,
    ]
      .filter(Boolean)
      .join(" / "),
  };

  state.personalEntries.push(entry);
  selfCheck.status = "approved";
  selfCheck.approvedAt = new Date().toISOString();
  appendAnalyticsEvent(state, "manager_approve", {
    actorRole: "manager",
    entryId: selfCheck.id,
    staffId: selfCheck.staffId,
    staffName: entry.staffName,
    date: selfCheck.date,
    approvedXp: entry.approvedXp || 0,
  });
  saveState();
  render();
}

function readApprovalPenalty(entryId, key) {
  const input = document.querySelector(`[data-approval-penalty="${entryId}:${key}"]`);
  return input?.checked ? 1 : 0;
}

function rejectSelfCheck(entryId) {
  const selfCheck = (state.selfChecks || []).find((entry) => entry.id === entryId);
  if (!selfCheck) return;
  const reason = prompt("반려 사유를 적어주세요. 비워도 반려 처리됩니다.") || "";
  selfCheck.status = "rejected";
  selfCheck.rejectedAt = new Date().toISOString();
  selfCheck.rejectReason = reason.trim();
  saveState();
  render();
}

function deleteSelfCheck(entryId) {
  const selfCheck = (state.selfChecks || []).find((entry) => entry.id === entryId);
  if (!selfCheck) return;
  const label = [selfCheck.date, selfCheck.staffName || selfCheck.staffId, selfCheck.status === "live" ? "진행중" : "승인 대기"]
    .filter(Boolean)
    .join(" · ");
  if (!confirm(`${label} 기록을 삭제할까요?\n삭제하면 직원 퀘스트 승인창에서 사라집니다.`)) return;
  state.selfChecks = (state.selfChecks || []).filter((entry) => entry.id !== entryId);
  saveState();
  render();
}

function buildBonusRow(row, hallTeamAverage, kitchenTeamAverage) {
  const settings = state.bonusSettings;
  const role = row.role;
  const isManager = isManagerRole(role);
  const isHall = isHallRole(role);
  const isKitchen = isKitchenRole(role);
  const personalRate = isPartTimeRole(role) ? Number(settings.partTimeRate || 0.5) : 1;
  const multiplier = row.kpiAverage >= settings.kpiGoodThreshold ? 1 : row.kpiAverage >= settings.kpiMinimumThreshold ? 0.5 : 0;
  if (isManager) {
    const managerPerformanceBonus = getManagerSalesBonus();
    const managerTeamBonus = isHall ? Math.round(getTeamBonus(hallTeamAverage) * multiplier)
      : isKitchen ? Math.round(getTeamBonus(kitchenTeamAverage) * multiplier)
        : 0;
    return {
      ...row,
      kpiBonus: 0,
      pointBonus: managerPerformanceBonus,
      teamBonus: managerTeamBonus,
      salesShare: 0,
      totalBonus: managerTeamBonus + managerPerformanceBonus,
    };
  }
  const kpiBonus = Math.round((row.kpiAverage >= settings.kpiTopThreshold ? settings.kpiTopBonus : row.kpiAverage >= settings.kpiGoodThreshold ? settings.kpiGoodBonus : 0) * personalRate);
  const pointBonus = role === "hall" || role === "hall-part" ? Math.round(getPointBonus(row.performancePoints) * multiplier * personalRate) : 0;
  const teamBonus = !isManager && isHall ? Math.round(getTeamBonus(hallTeamAverage) * multiplier)
    : !isManager && isKitchen ? Math.round(getTeamBonus(kitchenTeamAverage) * multiplier)
      : 0;
  const adjustedTeamBonus = Math.round(teamBonus * personalRate);
  const salesShare = role === "kitchen" || role === "kitchen-part" ? Math.round(getKitchenSalesShareBonus() * multiplier * personalRate) : 0;
  return {
    ...row,
    kpiBonus,
    pointBonus,
    teamBonus: adjustedTeamBonus,
    salesShare,
    totalBonus: kpiBonus + pointBonus + adjustedTeamBonus + salesShare,
  };
}

function renderPersonalLog(month) {
  const rows = monthEntries(state.personalEntries, month).slice(-15).reverse();
  if (!rows.length) {
    els.personalLogTable.innerHTML = `<tr><td colspan="6">기록 없음</td></tr>`;
    return;
  }
  els.personalLogTable.innerHTML = rows.map((entry) => {
    const person = staff.find((item) => item.id === entry.staffId);
    const score = calculatePersonalDaily(entry, person?.role || entry.role);
    return `
      <tr>
        <td>${entry.date}</td>
        <td>${escapeHtml(person?.name || entry.staffName || entry.staffId)}</td>
        <td>${formatScore(score.total)}</td>
        <td>-${Number(score.minus || 0)}</td>
        <td>${getPerformancePoints(entry)}P</td>
        <td><button class="btn danger mini-btn" type="button" data-delete-personal="${entry.id}">삭제</button></td>
      </tr>
    `;
  }).join("");
}

function renderTeamLog(month) {
  const weeklyChallenge = currentWeekTeamChallenge();
  const rows = monthEntries(state.teamEntries, month).slice(-15).reverse();
  if (!weeklyChallenge && !rows.length) {
    els.teamLogTable.innerHTML = `<tr><td colspan="6">기록 없음</td></tr>`;
    return;
  }
  const weeklyRow = weeklyChallenge ? `
    <tr class="team-log-summary-row">
      <td>이번주</td>
      <td>자동 합산</td>
      <td>${Number(weeklyChallenge.reviewCount || 0)} / ${Number(weeklyChallenge.reviewTarget || normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings).primaryTarget)}</td>
      <td>${teamClaimCount(weeklyChallenge)}건</td>
      <td>${escapeHtml(teamChallengeMemo(weeklyChallenge))}</td>
      <td>요약</td>
    </tr>
  ` : "";
  const manualRows = rows.map((entry) => `
    <tr>
      <td>${entry.date}</td>
      <td>${entry.team === "store" ? "전체 팀" : entry.team === "hall" ? "홀" : "주방"}</td>
      <td>${Number(entry.reviewCount || 0)} / ${Number(entry.reviewTarget || normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings).primaryTarget)}</td>
      <td>${teamClaimCount(entry)}건</td>
      <td>${escapeHtml(teamChallengeMemo(entry))}</td>
      <td><button class="btn danger mini-btn" type="button" data-delete-team="${entry.id}">삭제</button></td>
    </tr>
  `).join("");
  els.teamLogTable.innerHTML = `${weeklyRow}${manualRows}`;
}

function deletePersonalEntry(event) {
  const entryId = event.target.dataset.deletePersonal;
  if (!entryId) return;
  const deletedEntry = state.personalEntries.find((entry) => entry.id === entryId);
  if (!confirm("이 개인 KPI 기록을 삭제할까요?")) return;
  state.personalEntries = state.personalEntries.filter((entry) => entry.id !== entryId);
  if (deletedEntry?.sourceSelfCheckId) {
    state.selfChecks = (state.selfChecks || []).filter((entry) => entry.id !== deletedEntry.sourceSelfCheckId);
  }
  saveState();
  render();
}

function deleteTeamEntry(event) {
  const entryId = event.target.dataset.deleteTeam;
  if (!entryId) return;
  if (!confirm("이 팀 챌린지 기록을 삭제할까요?")) return;
  state.teamEntries = state.teamEntries.filter((entry) => entry.id !== entryId);
  saveState();
  render();
}

function renderTestTools() {
  if (!els.testStaffSelect) return;
  const selected = els.testStaffSelect.value;
  const activePeople = activeStaff();
  const people = activePeople.filter((person) => !isManagerRole(person.role));
  const managerCount = activePeople.filter((person) => isManagerRole(person.role)).length;
  const inactiveCount = (state.staff || []).filter((person) => person.active === false && !isManagerRole(person.role)).length;
  if (els.testStaffCount) {
    els.testStaffCount.textContent = `직원앱 테스트 ${people.length}명 · 매니저 ${managerCount}명 제외${inactiveCount ? ` · 비활성 ${inactiveCount}명 제외` : ""}`;
  }
  els.testStaffSelect.innerHTML = people.length
    ? people.map((person, index) => `<option value="${person.id}">${index + 1}. ${escapeHtml(person.name)} · ${roleLabel(person.role)}</option>`).join("")
    : `<option value="">테스트할 직원 없음 (매니저 제외)</option>`;
  els.testStaffSelect.size = Math.min(Math.max(people.length || 1, 5), 10);
  els.testStaffSelect.value = people.some((person) => person.id === selected) ? selected : (people[0]?.id || "");
}

async function handleTestToolAction(event) {
  const button = event.target.closest("[data-test-tool]");
  if (!button) return;
  const action = button.dataset.testTool;
  if (action === "refresh-staff") {
    setTestToolStatus("직원 목록을 다시 불러오는 중...");
    await syncCloudState();
    renderTestTools();
    const refreshedActivePeople = activeStaff();
    const refreshedPeople = refreshedActivePeople.filter((person) => !isManagerRole(person.role));
    const refreshedManagers = refreshedActivePeople.filter((person) => isManagerRole(person.role));
    setTestToolStatus(`직원 목록 새로고침 완료: 직원앱 테스트 ${refreshedPeople.length}명, 매니저 ${refreshedManagers.length}명 제외`);
    return;
  }
  if (action === "sample-pending") createSamplePendingSelfCheck();
  if (action === "clear-selected-today") clearSelectedTodayRecords();
  if (action === "clear-today-submissions") clearTodaySelfChecks();
  if (action === "clear-pending") clearPendingSelfChecks();
  if (action === "clear-today-all") clearTodayTestRecords();
}

function selectedTestStaff() {
  return activeStaff().find((person) => person.id === els.testStaffSelect?.value && !isManagerRole(person.role))
    || activeStaff().find((person) => !isManagerRole(person.role));
}

function createSamplePendingSelfCheck() {
  const person = selectedTestStaff();
  if (!person) {
    setTestToolStatus("테스트할 직원이 없습니다. 직원관리에서 직원을 먼저 추가해주세요.");
    return;
  }
  const date = toInputDate(new Date());
  const performanceReports = samplePerformanceReportsFor(person);
  const legacy = sampleLegacyPerformanceFor(person, performanceReports);
  const praisedPerson = activeStaff().find((item) => item.id !== person.id && !isManagerRole(item.role));
  state.selfChecks = (state.selfChecks || []).filter((entry) => !(
    entry.date === date && entry.staffId === person.id && ["live", "pending"].includes(entry.status)
  ));
  state.selfChecks.push({
    id: crypto.randomUUID(),
    date,
    staffId: person.id,
    staffName: person.name,
    role: person.role,
    roleName: roleLabel(person.role),
    attendance: 1,
    attendanceTime: "09:30",
    checkoutTime: "22:00",
    checkinMood: "응원",
    cleaningDone: true,
    cleanArea: isKitchenRole(person.role) ? "내 구역 마감 상태" : "홀 정리 상태",
    cleanStatus: "이상 없음",
    goalChecked: true,
    goalType: "테스트 운영 포인트 확인",
    helpSkipped: !praisedPerson,
    helpCount: praisedPerson ? 1 : 0,
    helpType: praisedPerson?.id || "",
    helpReason: praisedPerson ? "service" : "",
    helpNote: praisedPerson ? "테스트 칭찬" : "",
    photos: [],
    performanceReports,
    ...legacy,
    note: "관리자 테스트 도구로 만든 샘플 제출",
    status: "pending",
    createdAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  saveState();
  render();
  setTestToolStatus(`${person.name} 샘플 제출을 승인대기에 만들었어요.`);
}

function samplePerformanceReportsFor(person) {
  if (isKitchenRole(person.role)) {
    return [{ id: "clean-fridge-gasket", role: "kitchen", areaId: "fridge-gasket", label: "냉장고 손잡이/문틈/고무패킹", xp: 10, count: 1 }];
  }
  if (isMarketerRole(person.role)) {
    return [{ id: "threadPostPoint", role: "marketer", label: "쓰레드 포스팅", xp: 10, count: 1 }];
  }
  return [{ id: "reviewPoint", role: "hall", label: "리뷰 미션", xp: 10, count: 1 }];
}

function sampleLegacyPerformanceFor(person, reports) {
  const get = (id) => reports.find((report) => report.id === id)?.count || 0;
  const kitchenCount = reports.filter((report) => report.role === "kitchen").reduce((sum, report) => sum + Number(report.count || 0), 0);
  return {
    reviewPoint: isHallRole(person.role) ? get("reviewPoint") : 0,
    upsellPoint: 0,
    membershipPoint: 0,
    recommendedMenuPoint: 0,
    hygieneFixPoint: isKitchenRole(person.role) ? kitchenCount : 0,
    specialCleanArea: isKitchenRole(person.role) ? (reports.find((report) => report.role === "kitchen")?.areaId || "") : "",
    specialCleanXp: isKitchenRole(person.role) ? kitchenCount * 10 : 0,
    threadPostPoint: isMarketerRole(person.role) ? get("threadPostPoint") : 0,
    videoPostPoint: 0,
    tomorrowPlanPoint: 0,
    marketingReportPoint: 0,
  };
}

function clearSelectedTodayRecords() {
  const person = selectedTestStaff();
  if (!person) return;
  if (!confirm(`${person.name}님의 오늘 제출/승인 기록을 삭제할까요?`)) return;
  const removed = removeTodayRecords((entry) => entry.staffId === person.id, (entry) => entry.staffId === person.id);
  saveState();
  render();
  setTestToolStatus(`${person.name} 오늘 기록 ${removed}건을 삭제했어요.`);
}

function clearTodaySelfChecks() {
  if (!confirm("오늘 직원 제출 기록만 삭제할까요? 승인 완료 개인 기록은 남겨둡니다.")) return;
  const date = toInputDate(new Date());
  const before = (state.selfChecks || []).length;
  state.selfChecks = (state.selfChecks || []).filter((entry) => entry.date !== date);
  saveState();
  render();
  setTestToolStatus(`오늘 제출 ${before - state.selfChecks.length}건을 삭제했어요.`);
}

function clearPendingSelfChecks() {
  if (!confirm("승인대기/진행중 제출을 모두 비울까요?")) return;
  const before = (state.selfChecks || []).length;
  state.selfChecks = (state.selfChecks || []).filter((entry) => !["live", "pending"].includes(entry.status));
  saveState();
  render();
  setTestToolStatus(`승인대기/진행중 제출 ${before - state.selfChecks.length}건을 삭제했어요.`);
}

function clearTodayTestRecords() {
  if (!confirm("오늘 제출, 오늘 승인 개인 기록, 오늘 팀 기록을 모두 삭제할까요?")) return;
  const date = toInputDate(new Date());
  const before = totalRecordCount();
  state.selfChecks = (state.selfChecks || []).filter((entry) => entry.date !== date);
  state.personalEntries = (state.personalEntries || []).filter((entry) => entry.date !== date);
  state.teamEntries = (state.teamEntries || []).filter((entry) => entry.date !== date);
  saveState();
  render();
  setTestToolStatus(`오늘 테스트 기록 ${before - totalRecordCount()}건을 초기화했어요.`);
}

function removeTodayRecords(selfCheckPredicate, personalPredicate) {
  const date = toInputDate(new Date());
  const before = totalRecordCount();
  state.selfChecks = (state.selfChecks || []).filter((entry) => !(entry.date === date && selfCheckPredicate(entry)));
  state.personalEntries = (state.personalEntries || []).filter((entry) => !(entry.date === date && personalPredicate(entry)));
  return before - totalRecordCount();
}

function totalRecordCount() {
  return (state.selfChecks || []).length + (state.personalEntries || []).length + (state.teamEntries || []).length;
}

function setTestToolStatus(message) {
  if (els.testToolStatus) els.testToolStatus.textContent = message;
}

function teamAverage(team, month) {
  const monthRows = monthEntries(state.teamEntries, month);
  const storeRows = monthRows.filter((entry) => entry.team === "store");
  const rows = storeRows.length ? storeRows : monthRows.filter((entry) => entry.team === team);
  return rows.length ? average(rows.map(teamEntryTotal)) : 0;
}

function latestTeamChallengeEntry(month = els.referenceMonth?.value || toMonthInput(new Date())) {
  return monthEntries(state.teamEntries || [], month)
    .filter((entry) => entry.team === "store" || entry.reviewCount !== undefined)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.id || "").localeCompare(String(a.id || "")))[0] || null;
}

function currentWeekTeamChallenge(targetDate = toInputDate(new Date())) {
  const teamConfig = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);
  if (!teamConfig.enabled) return null;
  const range = periodDateRange("week", targetDate);
  const rows = (state.teamEntries || [])
    .filter((entry) => entry.date >= range.start && entry.date <= range.end)
    .filter((entry) => entry.team === "store" || entry.reviewCount !== undefined)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.id || "").localeCompare(String(a.id || "")));
  if (!rows.length) return null;
  return {
    ...rows[0],
    reviewCount: rows.reduce((sum, entry) => sum + Number(entry.reviewCount || 0), 0),
    reviewTarget: teamConfig.primaryTarget,
    primaryLabel: teamConfig.primaryLabel,
    claimCount: rows.reduce((sum, entry) => sum + teamClaimCount(entry), 0),
    secondaryLabel: teamConfig.secondaryLabel,
  };
}

function teamEntryTotal(entry) {
  return Number(entry.item1 || 0) + Number(entry.item2 || 0) + Number(entry.item3 || 0) + Number(entry.item4 || 0) + Number(entry.item5 || 0);
}

function teamClaimCount(entry) {
  return Number(entry?.claimCount ?? entry?.claimZeroDays ?? 0);
}

function teamChallengeMemo(entry) {
  if (!entry) return "-";
  const teamConfig = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);
  const primaryLabel = entry.primaryLabel || teamConfig.primaryLabel;
  const secondaryLabel = entry.secondaryLabel || teamConfig.secondaryLabel;
  const review = `${Number(entry.reviewCount || 0)} / ${Number(entry.reviewTarget || teamConfig.primaryTarget)}`;
  const claim = `${teamClaimCount(entry)}건`;
  return [entry.memo || "조금만 더 힘내요!", `${primaryLabel} ${review}`, `${secondaryLabel} ${claim}`].join(" · ");
}

function getTeamBonus(score) {
  const settings = state.bonusSettings;
  if (score >= settings.teamTopThreshold) return Number(settings.teamTopBonus || 0);
  if (score >= settings.teamGoodThreshold) return Number(settings.teamGoodBonus || 0);
  return 0;
}

function getPointBonus(points) {
  const settings = state.bonusSettings;
  if (points >= settings.pointTopThreshold) return Number(settings.pointTopBonus || 0);
  if (points >= settings.pointGoodThreshold) return Number(settings.pointGoodBonus || 0);
  if (points >= settings.pointBaseThreshold) return Number(settings.pointBaseBonus || 0);
  return 0;
}

function getKitchenSalesShareBonus() {
  const settings = state.bonusSettings;
  const sales = Number(state.monthlySales || 0);
  if (sales < settings.salesBaseAmount) return 0;
  return Number(settings.salesBaseBonus || 0) + Math.floor((sales - settings.salesBaseAmount) / settings.salesStepAmount) * Number(settings.salesStepBonus || 0);
}

function getManagerSalesBonus() {
  const settings = state.bonusSettings;
  const sales = Number(state.monthlySales || 0);
  if (sales < settings.managerSalesBaseAmount) return 0;
  return Number(settings.managerSalesBaseBonus || 0) + Math.floor((sales - settings.managerSalesBaseAmount) / settings.managerSalesStepAmount) * Number(settings.managerSalesStepBonus || 0);
}

function kpiStatus(score) {
  const settings = state.bonusSettings;
  if (score >= settings.kpiTopThreshold) return "MVP급";
  if (score >= settings.kpiGoodThreshold) return "우수";
  if (score >= settings.kpiMinimumThreshold) return "안정";
  return "경고";
}

function teamStatus(score) {
  if (score >= 9) return "최고";
  if (score >= 8) return "우수";
  if (score >= 7) return "보통";
  return "위험";
}

function exportCsv() {
  const personal = state.personalEntries.map((entry) => {
    const person = staff.find((item) => item.id === entry.staffId);
    const score = calculatePersonalDaily(entry, person?.role || entry.role);
    return ["personal", entry.date, person?.name || entry.staffName || entry.staffId, roleLabel(person?.role || entry.role), score.total, score.minus || 0, getPerformancePoints(entry)].join(",");
  });
  const team = state.teamEntries.map((entry) => ["team", entry.date, entry.team, Number(entry.reviewCount || 0), teamClaimCount(entry), "", entry.memo || ""].join(","));
  const blob = new Blob([["type,date,name_or_team,role_or_review,kpi_or_claim,minus_total,points_or_memo", ...personal, ...team].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `doya-final-kpi-${toInputDate(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function monthEntries(entries, month) {
  return (entries || []).filter((entry) => entry.date?.slice(0, 7) === month);
}

function recentEntries(entries, days) {
  const end = toInputDate(new Date());
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  const start = toInputDate(startDate);
  return (entries || []).filter((entry) => entry.date >= start && entry.date <= end);
}

function periodDateRange(period, targetDate) {
  const base = parseLocalDate(targetDate);
  if (period === "month") {
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { start: toInputDate(start), end: toInputDate(end) };
  }
  const mondayOffset = (base.getDay() + 6) % 7;
  const start = new Date(base);
  start.setDate(base.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toInputDate(start), end: toInputDate(end) };
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

function isHallRole(role) {
  return role === "hall" || role === "hall-manager" || role === "hall-part";
}

function isKitchenRole(role) {
  return role === "kitchen" || role === "kitchen-manager" || role === "kitchen-part";
}

function isMarketerRole(role) {
  return role === "marketer";
}

function isManagerRole(role) {
  return role === "hall-manager" || role === "kitchen-manager";
}

function isPartTimeRole(role) {
  return role === "hall-part" || role === "kitchen-part";
}

function readNumber(input) {
  return Number(input?.value || 0);
}

function toBoolean(value, fallback = true) {
  if (value === true || value === false) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "off", "no"].includes(normalized)) return false;
    if (["true", "1", "on", "yes"].includes(normalized)) return true;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthInput(date) {
  return toInputDate(date).slice(0, 7);
}

function parseLocalDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function average(numbers) {
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatScore(value) {
  return `${Number(value || 0).toFixed(1).replace(".0", "")}점`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
