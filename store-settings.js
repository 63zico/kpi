const storageKey = "doya-kpi-levelup-v2";

function appStorageKey() {
  return window.LeveloveAuth?.stateStorageKey?.(storageKey) || storageKey;
}

const defaultCustomQuests = [
  { id: "review-photo", title: "리뷰 사진 인증", points: 1, enabled: true },
  { id: "team-help", title: "팀 도와주기", points: 1, enabled: true },
  { id: "sales-xp", title: "판매 성과 XP", points: 1, enabled: true },
];

const defaultPerformanceItems = {
  hall: [
    { id: "review-photo", role: "hall", ko: "리뷰 사진 인증", vi: "Xác nhận ảnh review", xp: 1, max: 1 },
    { id: "team-help", role: "hall", ko: "팀 도와주기", vi: "Hỗ trợ đồng đội", xp: 1, max: 1 },
    { id: "sales-xp", role: "hall", ko: "판매 성과 XP", vi: "Thành tích bán hàng", xp: 1, max: 1 },
  ],
  kitchen: [
    { id: "fridge-gasket", role: "kitchen", areaId: "fridge-gasket", ko: "냉장고 손잡이/문틈/고무패킹", vi: "Tay nắm/khe cửa tủ lạnh", xp: 10, max: 1 },
    { id: "fridge-inside", role: "kitchen", areaId: "fridge-inside", ko: "냉장고 안 청소", vi: "Vệ sinh trong tủ lạnh", xp: 10, max: 1 },
    { id: "freezer-defrost", role: "kitchen", areaId: "freezer-defrost", ko: "냉동고 성에 제거", vi: "Xả đá tủ đông", xp: 10, max: 1 },
    { id: "sink-drain", role: "kitchen", areaId: "sink-drain", ko: "싱크대 하부/배수구 주변", vi: "Khu vực thoát nước", xp: 10, max: 1 },
    { id: "glass-cleaning", role: "kitchen", areaId: "glass-cleaning", ko: "유리청소", vi: "Lau kính", xp: 10, max: 1 },
    { id: "hood-grease", role: "kitchen", areaId: "hood-grease", ko: "후드기름때 청소", vi: "Vệ sinh máy hút mùi", xp: 10, max: 1 },
    { id: "prep-table-legs", role: "kitchen", areaId: "prep-table-legs", ko: "조리대 밑/다리 주변", vi: "Dưới bàn sơ chế", xp: 10, max: 1 },
    { id: "storage-shelves", role: "kitchen", areaId: "storage-shelves", ko: "재료 보관 선반", vi: "Kệ nguyên liệu", xp: 10, max: 1 },
    { id: "gas-room", role: "kitchen", areaId: "gas-room", ko: "가스실 청소", vi: "Khu vực gas", xp: 10, max: 1 },
  ],
  marketer: [
    { id: "thread-post", role: "marketer", ko: "쓰레드 포스팅", vi: "Đăng Threads", xp: 1, max: 1 },
    { id: "video-post", role: "marketer", ko: "영상 촬영 및 포스팅", vi: "Quay và đăng video", xp: 1, max: 1 },
    { id: "tomorrow-plan", role: "marketer", ko: "내일 마케팅 기획", vi: "Kế hoạch marketing ngày mai", xp: 1, max: 1 },
    { id: "marketing-report", role: "marketer", ko: "마케팅 성과 보고", vi: "Báo cáo marketing", xp: 1, max: 1 },
  ],
};

const rolePerformanceLabels = {
  hall: "홀 성과",
  kitchen: "주방 성과",
  marketer: "마케팅 성과",
};

const defaultRankingSettings = [
  {
    id: "review-award",
    title: "리뷰왕",
    role: "hall",
    missionIds: ["review-photo"],
    enabled: true,
    cheer: "리뷰 한 번이 이번 달 트로피에 가까워지는 길이에요.",
    monthlyTrophy: true,
    mark: "⭐",
  },
  {
    id: "upsell-award",
    title: "업셀왕",
    role: "hall",
    missionIds: ["sales-xp"],
    enabled: true,
    cheer: "추천 성공을 차곡차곡 모아봐요.",
    monthlyTrophy: true,
    mark: "⚡",
  },
  {
    id: "praise-award",
    title: "칭찬왕",
    role: "all",
    missionIds: ["praise"],
    enabled: true,
    cheer: "동료에게 받은 고마움도 멋진 성과예요.",
    monthlyTrophy: true,
    mark: "💬",
  },
  {
    id: "cleaning-award",
    title: "청소왕",
    role: "kitchen",
    missionIds: ["kitchen-performance"],
    enabled: true,
    cheer: "깨끗한 구역을 하나씩 클리어해요.",
    monthlyTrophy: true,
    mark: "✨",
  },
  {
    id: "marketing-award",
    title: "마케팅왕",
    role: "marketer",
    missionIds: ["marketer-performance"],
    enabled: true,
    cheer: "콘텐츠와 보고가 매장의 성장을 만들어요.",
    monthlyTrophy: true,
    mark: "📣",
  },
];

const rankingRoleLabels = {
  all: "전체",
  hall: "홀",
  kitchen: "주방",
  marketer: "마케팅",
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
  customQuests: defaultCustomQuests,
  performanceItems: defaultPerformanceItems,
  rankingSettings: defaultRankingSettings,
};

const templateQuests = {
  "korean-restaurant": ["출근 체크", "오늘 운영 포인트 확인", "퇴근 전 점검", "리뷰 사진 인증", "판매 성과 기록"],
  cafe: ["출근 체크", "오픈/마감 준비", "청소 및 정리", "추천 메뉴 안내", "리뷰 사진 인증"],
  pub: ["출근 체크", "테이블 정리", "주문 실수 방지", "주류/메뉴 추천", "마감 점검"],
  delivery: ["출근 체크", "포장 상태 확인", "주문 누락 확인", "배달 리뷰 확인", "마감 정리"],
  custom: ["출근 체크", "오늘 목표 확인", "사진 인증", "팀 지원 기록", "매니저 승인"],
};

const questLabels = {
  attendance: "출근 체크",
  cleaning: "퇴근 전 점검",
  goal: "오늘 운영 포인트 확인",
  photo: "리뷰 사진 인증",
  help: "팀 도와주기",
  serviceXp: "판매 성과 XP",
};

const coreQuestLabels = [questLabels.attendance, questLabels.cleaning, questLabels.goal];

let state = loadState();
let settings = normalizeStoreSettings(state.storeSettings);
let activeRoleSettingsTab = "hall";

const form = document.querySelector("#storeSettingsForm");
const fields = {
  storeName: document.querySelector("#storeName"),
  industry: document.querySelector("#industry"),
  template: document.querySelector("#template"),
  defaultLanguage: document.querySelector("#defaultLanguage"),
  rankingVisibility: document.querySelector("#rankingVisibility"),
  bonusEnabled: document.querySelector("#bonusEnabled"),
  customQuestList: document.querySelector("#customQuestList"),
  addCustomQuestBtn: document.querySelector("#addCustomQuestBtn"),
  rolePerformanceSettings: document.querySelector("#rolePerformanceSettings"),
  rankingSettings: document.querySelector("#rankingSettings"),
  operationPoints: document.querySelector("#operationPoints"),
  teamChallengeEnabled: document.querySelector("#teamChallengeEnabled"),
  teamChallengeTitle: document.querySelector("#teamChallengeTitle"),
  teamChallengePrimaryLabel: document.querySelector("#teamChallengePrimaryLabel"),
  teamChallengePrimaryTarget: document.querySelector("#teamChallengePrimaryTarget"),
  teamChallengeSecondaryLabel: document.querySelector("#teamChallengeSecondaryLabel"),
  syncStoreName: document.querySelector("#syncStoreName"),
  syncStorageScope: document.querySelector("#syncStorageScope"),
  syncSaveState: document.querySelector("#syncSaveState"),
  syncAppVersion: document.querySelector("#syncAppVersion"),
  launchChecklist: document.querySelector("#launchChecklist"),
  launchReadyBadge: document.querySelector("#launchReadyBadge"),
};
const templatePreview = document.querySelector("#templatePreview");
const storeSettingsTabButtons = [...document.querySelectorAll("[data-store-settings-tab]")];
const storeSettingsPanels = [...document.querySelectorAll("[data-store-settings-panel]")];

const authResult = window.LeveloveAuth?.requireRole?.(["owner", "admin", "manager"]);
if (authResult && !authResult.ok) {
  form?.setAttribute("hidden", "");
} else {
  updateSyncStatus("로컬 설정 확인 중");
  importLegacyStoreSettingsFromDefaultStore();
  renderSettings();
  renderTemplatePreview();
  renderLaunchChecklist();
  syncCloudState();
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  settings = readSettings();
  state.storeSettings = settings;
  updateSyncStatus("저장 중...");
  saveStoreSettingsEverywhere("클라우드 저장됨");
  localStorage.removeItem("levelove-employee-lang");
  alert("매장 설정을 저장했어요. 직원 화면에 바로 반영됩니다.");
  renderTemplatePreview();
  renderLaunchChecklist();
});

fields.industry?.addEventListener("change", () => {
  settings.template = templateForIndustry(fields.industry.value);
  renderTemplatePreview();
});

storeSettingsTabButtons.forEach((button) => {
  button.addEventListener("click", () => setStoreSettingsTab(button.dataset.storeSettingsTab));
});

fields.addCustomQuestBtn?.addEventListener("click", () => {
  settings.customQuests = [
    ...readCustomQuestsFromDom(),
    {
      id: `custom-${Date.now()}`,
      title: "새 퀘스트",
      points: 1,
      enabled: true,
    },
  ];
  renderCustomQuestList();
  renderTemplatePreview();
  fields.customQuestList?.querySelector(".custom-quest-row:last-child input[data-field='title']")?.focus();
});

fields.customQuestList?.addEventListener("input", (event) => {
  if (!event.target.matches("[data-field]")) return;
  settings.customQuests = readCustomQuestsFromDom();
  renderTemplatePreview();
});

fields.customQuestList?.addEventListener("change", (event) => {
  if (!event.target.matches("[data-field='enabled']")) return;
  const row = event.target.closest(".custom-quest-row");
  const badge = row?.querySelector(".custom-quest-toggle span");
  if (badge) badge.textContent = event.target.checked ? "ON" : "OFF";
  settings.customQuests = readCustomQuestsFromDom();
  renderTemplatePreview();
});

fields.customQuestList?.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-custom-quest]");
  if (!removeButton) return;
  settings.customQuests = readCustomQuestsFromDom().filter((quest) => quest.id !== removeButton.dataset.removeCustomQuest);
  renderCustomQuestList();
  renderTemplatePreview();
});

fields.rolePerformanceSettings?.addEventListener("input", (event) => {
  if (!event.target.matches("[data-field]")) return;
  settings.performanceItems = readPerformanceItemsFromDom();
  renderTemplatePreview();
  renderRankingSettings();
  scheduleSettingsAutosave();
});

fields.rolePerformanceSettings?.addEventListener("change", (event) => {
  if (!event.target.matches("[data-field='enabled']")) return;
  const row = event.target.closest(".role-performance-row");
  const badge = row?.querySelector(".custom-quest-toggle span");
  if (badge) badge.textContent = event.target.checked ? "ON" : "OFF";
  settings.performanceItems = readPerformanceItemsFromDom();
  renderTemplatePreview();
  renderRankingSettings();
  scheduleSettingsAutosave(0);
});

fields.rolePerformanceSettings?.addEventListener("click", (event) => {
  const roleTab = event.target.closest("[data-performance-role-tab]");
  if (roleTab) {
    activeRoleSettingsTab = roleTab.dataset.performanceRoleTab || "hall";
    updatePerformanceRoleTabs();
    return;
  }
  const addButton = event.target.closest("[data-add-performance-role]");
  if (addButton) {
    const role = addButton.dataset.addPerformanceRole;
    settings.performanceItems = readPerformanceItemsFromDom();
    settings.performanceItems[role] = [
      ...(settings.performanceItems[role] || []),
      {
        id: `${role}-${Date.now()}`,
        role,
        ko: "새 성과 미션",
        vi: "Nhiệm vụ mới",
        xp: role === "kitchen" ? 10 : 1,
        max: 1,
      },
    ];
    renderPerformanceSettings();
    renderRankingSettings();
    renderTemplatePreview();
    scheduleSettingsAutosave(0);
    fields.rolePerformanceSettings?.querySelector(`[data-role="${role}"] .role-performance-row:last-child input[data-field="ko"]`)?.focus();
    return;
  }
  const removeButton = event.target.closest("[data-remove-performance-item]");
  if (!removeButton) return;
  const role = removeButton.dataset.role;
  settings.performanceItems = readPerformanceItemsFromDom();
  settings.performanceItems[role] = (settings.performanceItems[role] || []).filter((item) => item.id !== removeButton.dataset.removePerformanceItem);
  renderPerformanceSettings();
  renderRankingSettings();
  renderTemplatePreview();
  scheduleSettingsAutosave(0);
});

fields.rankingSettings?.addEventListener("input", (event) => {
  if (!event.target.matches("[data-field]")) return;
  settings.rankingSettings = readRankingSettingsFromDom();
  scheduleSettingsAutosave();
});

fields.rankingSettings?.addEventListener("change", (event) => {
  if (!event.target.matches("[data-field]")) return;
  if (event.target.dataset.field === "enabled") {
    const row = event.target.closest(".ranking-setting-row");
    const badge = row?.querySelector(".custom-quest-toggle span");
    if (badge) badge.textContent = event.target.checked ? "ON" : "OFF";
  }
  settings.rankingSettings = readRankingSettingsFromDom();
  scheduleSettingsAutosave(0);
});

fields.rankingSettings?.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-ranking-setting]");
  if (addButton) {
    settings.rankingSettings = [
      ...readRankingSettingsFromDom(),
      {
        id: `ranking-${Date.now()}`,
        title: "새로운 왕",
        role: "all",
        missionIds: ["praise"],
        enabled: true,
        cheer: "이번 달 트로피 후보예요.",
        monthlyTrophy: true,
        mark: "🏆",
      },
    ];
    renderRankingSettings();
    scheduleSettingsAutosave(0);
    fields.rankingSettings?.querySelector(".ranking-setting-row:last-child input[data-field='title']")?.focus();
    return;
  }
  const removeButton = event.target.closest("[data-remove-ranking-setting]");
  if (!removeButton) return;
  settings.rankingSettings = readRankingSettingsFromDom().filter((item) => item.id !== removeButton.dataset.removeRankingSetting);
  renderRankingSettings();
  scheduleSettingsAutosave(0);
});

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(appStorageKey())) || {};
  } catch {
    return {};
  }
}

function setStoreSettingsTab(tab) {
  const nextTab = ["basic", "performance"].includes(tab) ? tab : "basic";
  storeSettingsTabButtons.forEach((button) => {
    const isActive = button.dataset.storeSettingsTab === nextTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  storeSettingsPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.storeSettingsPanel === nextTab);
  });
}

function scheduleSettingsAutosave(delay = 450) {
  window.clearTimeout(scheduleSettingsAutosave.timer);
  updateSyncStatus(delay ? "자동저장 대기" : "저장 중...");
  scheduleSettingsAutosave.timer = window.setTimeout(() => {
    settings = readSettings();
    state.storeSettings = settings;
    saveStoreSettingsEverywhere("클라우드 저장됨");
    localStorage.removeItem("levelove-employee-lang");
  }, delay);
}

function saveStoreSettingsEverywhere(successText = "클라우드 저장됨") {
  localStorage.setItem(appStorageKey(), JSON.stringify(state));
  if (typeof saveStateToCloud !== "function" || typeof cloudEnabled !== "function" || !cloudEnabled()) {
    updateSyncStatus("로컬 저장됨");
    return Promise.resolve(false);
  }
  return saveStateToCloud(state)
    .then(() => {
      updateSyncStatus(successText);
      return true;
    })
    .catch((error) => {
      console.warn(error);
      updateSyncStatus("로컬 저장됨");
      return false;
    });
}

async function syncCloudState() {
  try {
    updateSyncStatus("클라우드 확인 중");
    const cloudState = await loadStateFromCloud();
    if (!cloudState) {
      if (importLegacyStoreSettingsFromDefaultStore()) {
        renderSettings();
        renderTemplatePreview();
        renderLaunchChecklist();
      }
      updateSyncStatus("로컬 설정 사용 중");
      return;
    }
    state = { ...state, ...cloudState, storeSettings: normalizeStoreSettings(cloudState.storeSettings) };
    settings = normalizeStoreSettings(state.storeSettings);
    importLegacyStoreSettingsFromDefaultStore();
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
    renderSettings();
    renderTemplatePreview();
    renderLaunchChecklist();
    updateSyncStatus("클라우드 연동됨");
  } catch (error) {
    console.warn(error);
    updateSyncStatus("로컬 설정 사용 중");
  }
}

function importLegacyStoreSettingsFromDefaultStore() {
  const currentKey = appStorageKey();
  if (currentKey === storageKey) return false;
  let legacyState;
  try {
    legacyState = JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    legacyState = null;
  }
  if (!legacyState?.storeSettings) return false;
  const storeId = window.LeveloveAuth?.activeStoreId?.() || "";
  const migrationKey = storeId ? `storeSettingsMigrated:${storeId}` : "";
  if (migrationKey && legacyState[migrationKey]) return false;
  const legacySettings = normalizeStoreSettings(legacyState.storeSettings);
  const currentSettings = normalizeStoreSettings(state.storeSettings);
  const mergedRankings = mergeRankingSettings(currentSettings.rankingSettings, legacySettings.rankingSettings);
  const nextSettings = normalizeStoreSettings({
    ...currentSettings,
    ...legacySettings,
    rankingSettings: mergedRankings,
  });
  const before = JSON.stringify(currentSettings);
  const after = JSON.stringify(nextSettings);
  if (before === after) return false;
  settings = nextSettings;
  state.storeSettings = nextSettings;
  localStorage.setItem(appStorageKey(), JSON.stringify(state));
  if (migrationKey) {
    legacyState[migrationKey] = new Date().toISOString();
    localStorage.setItem(storageKey, JSON.stringify(legacyState));
  }
  saveStoreSettingsEverywhere("이전 설정 이동됨");
  return true;
}

function updateSyncStatus(saveText = "준비 중") {
  if (fields.syncStoreName) fields.syncStoreName.textContent = settings.storeName || state.storeSettings?.storeName || "우리 매장";
  const storeId = window.LeveloveAuth?.activeStoreId?.() || "main";
  const storageScope = storeId && storeId !== "main" ? "로그인 매장" : "기본 저장소";
  if (fields.syncStorageScope) fields.syncStorageScope.textContent = storageScope;
  if (fields.syncSaveState) fields.syncSaveState.textContent = saveText;
  if (fields.syncAppVersion) fields.syncAppVersion.textContent = "20260603-mobile-one-tap-checkin-1";
  renderLaunchChecklist();
}

function renderLaunchChecklist() {
  if (!fields.launchChecklist) return;
  const activeStaff = activeLaunchStaff();
  const performanceCount = enabledPerformanceCount();
  const submittedCount = (state.selfChecks || []).length + (state.personalEntries || []).length;
  const storeId = window.LeveloveAuth?.activeStoreId?.() || "main";
  const items = [
    {
      title: "로그인 매장 저장",
      detail: storeId && storeId !== "main" ? "매장별 저장소에 연결됨" : "로그인 후 매장 저장소 확인",
      done: Boolean(storeId && storeId !== "main"),
    },
    {
      title: "매장 이름",
      detail: settings.storeName ? settings.storeName : "매장 이름 입력 필요",
      done: Boolean(String(settings.storeName || "").trim()),
    },
    {
      title: "직원 등록",
      detail: activeStaff.length ? `${activeStaff.length}명 사용 중` : "직원 관리에서 직원 추가",
      done: activeStaff.length > 0,
    },
    {
      title: "성과 미션",
      detail: performanceCount ? `${performanceCount}개 켜짐` : "역할별 성과를 1개 이상 켜기",
      done: performanceCount > 0,
    },
    {
      title: "테스트 제출",
      detail: submittedCount ? `${submittedCount}건 기록 확인` : "직원화면에서 샘플 제출 필요",
      done: submittedCount > 0,
    },
  ];
  const doneCount = items.filter((item) => item.done).length;
  if (fields.launchReadyBadge) {
    fields.launchReadyBadge.textContent = `${doneCount} / ${items.length} 완료`;
    fields.launchReadyBadge.classList.toggle("is-ready", doneCount === items.length);
  }
  fields.launchChecklist.innerHTML = items.map((item) => `
    <article class="launch-check-item ${item.done ? "is-done" : ""}">
      <span class="launch-check-icon">${item.done ? "OK" : "!"}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.detail)}</small>
      </div>
    </article>
  `).join("");
}

function activeLaunchStaff() {
  return (Array.isArray(state.staff) ? state.staff : [])
    .filter((person) => person?.active !== false && !isManagerRole(person?.role));
}

function isManagerRole(role) {
  return String(role || "").includes("manager");
}

function enabledPerformanceCount() {
  return Object.values(normalizePerformanceItems(settings.performanceItems))
    .flat()
    .filter((item) => item.enabled !== false)
    .length;
}

function enabledRankingCount() {
  return normalizeRankingSettings(settings.rankingSettings, settings.performanceItems)
    .filter((item) => item.enabled !== false)
    .length;
}

function mergeRankingSettings(currentRankings = [], legacyRankings = []) {
  const byKey = new Map();
  currentRankings.forEach((item) => {
    const key = rankingSettingKey(item);
    if (key) byKey.set(key, item);
  });
  legacyRankings.forEach((item) => {
    const key = rankingSettingKey(item);
    if (key) byKey.set(key, { ...(byKey.get(key) || {}), ...item });
  });
  return [...byKey.values()];
}

function rankingSettingKey(item) {
  return String(item?.id || item?.title || "").trim();
}

function normalizeStoreSettings(value) {
  const performanceItems = normalizePerformanceItems(value?.performanceItems);
  return {
    ...defaultStoreSettings,
    ...(value || {}),
    operationPoints: normalizeOperationPoints(value?.operationPoints),
    dailyOperationPoints: normalizeOptionalOperationPoints(value?.dailyOperationPoints),
    dailyOperationDate: String(value?.dailyOperationDate || "").trim(),
    teamChallengeSettings: normalizeTeamChallengeSettings(value?.teamChallengeSettings),
    questSettings: {
      ...defaultStoreSettings.questSettings,
      ...((value || {}).questSettings || {}),
      attendance: true,
      cleaning: true,
      goal: true,
    },
    customQuests: normalizeCustomQuests(value?.customQuests),
    performanceItems,
    rankingSettings: normalizeRankingSettings(value?.rankingSettings, performanceItems),
  };
}

function renderSettings() {
  fields.storeName.value = settings.storeName || "";
  fields.industry.value = settings.industry || "restaurant";
  fields.defaultLanguage.value = settings.defaultLanguage || "ko";
  fields.rankingVisibility.value = "private";
  if (fields.bonusEnabled) {
    fields.bonusEnabled.value = String(settings.bonusEnabled === true);
  }
  renderTeamChallengeSettings();
  if (fields.operationPoints) {
    fields.operationPoints.value = normalizeOperationPoints(settings.operationPoints).join("\n");
  }
  renderPerformanceSettings();
  renderRankingSettings();
}

function readSettings() {
  return {
    storeName: fields.storeName.value.trim() || "우리 매장",
    industry: fields.industry.value,
    template: templateForIndustry(fields.industry.value),
    defaultLanguage: fields.defaultLanguage.value,
    rankingVisibility: "private",
    bonusEnabled: false,
    operationPoints: fields.operationPoints
      ? parseOperationPoints(fields.operationPoints.value)
      : normalizeOperationPoints(settings.operationPoints),
    dailyOperationPoints: normalizeOptionalOperationPoints(settings.dailyOperationPoints),
    dailyOperationDate: String(settings.dailyOperationDate || "").trim(),
    teamChallengeSettings: readTeamChallengeSettingsFromDom(),
    questSettings: {
      attendance: true,
      cleaning: true,
      goal: true,
      photo: true,
      help: true,
      serviceXp: true,
    },
    customQuests: [],
    performanceItems: readPerformanceItemsFromDom(),
    rankingSettings: readRankingSettingsFromDom(),
  };
}

function renderTemplatePreview() {
  const roleItems = Object.values(readPerformanceItemsFromDom())
    .flat()
    .filter((item) => item.enabled !== false && item.ko)
    .map((item) => `${item.ko} · 성과 포인트 ${item.xp}점`);
  const quests = [...coreQuestLabels, ...roleItems];

  templatePreview.innerHTML = quests.map((quest, index) => `
    <article class="template-quest">
      <span>${index < coreQuestLabels.length ? "기본" : index - coreQuestLabels.length + 1}</span>
      <strong>${escapeHtml(quest)}</strong>
      <small>${index < coreQuestLabels.length ? "모든 매장 기본 제공" : "역할별 성과 미션"}</small>
    </article>
  `).join("");
}

function normalizeQuestSettings(value) {
  return { ...defaultStoreSettings.questSettings, ...(value || {}) };
}

function normalizeTeamChallengeSettings(value) {
  const fallback = defaultStoreSettings.teamChallengeSettings;
  const target = Number.parseInt(value?.primaryTarget ?? fallback.primaryTarget, 10);
  return {
    enabled: toBoolean(value?.enabled, true),
    title: String(value?.title || fallback.title).trim(),
    primaryLabel: String(value?.primaryLabel || fallback.primaryLabel).trim(),
    primaryTarget: Number.isFinite(target) ? Math.min(999, Math.max(1, target)) : fallback.primaryTarget,
    secondaryLabel: String(value?.secondaryLabel || fallback.secondaryLabel).trim(),
  };
}

function renderTeamChallengeSettings() {
  if (!fields.teamChallengeTitle) return;
  const config = normalizeTeamChallengeSettings(settings.teamChallengeSettings);
  if (fields.teamChallengeEnabled) fields.teamChallengeEnabled.checked = config.enabled;
  fields.teamChallengeTitle.value = config.title;
  fields.teamChallengePrimaryLabel.value = config.primaryLabel;
  fields.teamChallengePrimaryTarget.value = config.primaryTarget;
  fields.teamChallengeSecondaryLabel.value = config.secondaryLabel;
}

function readTeamChallengeSettingsFromDom() {
  if (!fields.teamChallengeTitle) return normalizeTeamChallengeSettings(settings.teamChallengeSettings);
  return normalizeTeamChallengeSettings({
    enabled: fields.teamChallengeEnabled?.checked ?? true,
    title: fields.teamChallengeTitle.value,
    primaryLabel: fields.teamChallengePrimaryLabel.value,
    primaryTarget: fields.teamChallengePrimaryTarget.value,
    secondaryLabel: fields.teamChallengeSecondaryLabel.value,
  });
}

function templateForIndustry(industry) {
  const map = {
    restaurant: "korean-restaurant",
    cafe: "cafe",
    pub: "pub",
    delivery: "delivery",
    franchise: "korean-restaurant",
  };
  return map[industry] || "korean-restaurant";
}

function normalizeCustomQuests(value) {
  const source = Array.isArray(value) ? value : defaultCustomQuests;
  const quests = source
    .map((quest, index) => ({
      id: String(quest?.id || `custom-${index + 1}`),
      title: String(quest?.title || "").trim(),
      points: parsePerformancePoints(quest),
      enabled: toBoolean(quest?.enabled, true),
    }))
    .filter((quest) => quest.title);
  return quests.length ? quests : defaultCustomQuests.map((quest) => ({ ...quest }));
}

function renderCustomQuestList() {
  if (!fields.customQuestList) return;
  const quests = normalizeCustomQuests(settings.customQuests);
  fields.customQuestList.innerHTML = quests.map((quest) => `
    <article class="custom-quest-row" data-quest-id="${escapeHtml(quest.id)}">
      <label class="custom-quest-toggle">
        <input type="checkbox" data-field="enabled" ${quest.enabled ? "checked" : ""} />
        <span>${quest.enabled ? "ON" : "OFF"}</span>
      </label>
      <label>
        퀘스트 이름
        <input type="text" data-field="title" value="${escapeHtml(quest.title)}" placeholder="예: 리뷰 사진 인증" />
      </label>
      <label>
        성과 포인트
        <input type="number" data-field="points" min="1" max="99" step="1" value="${quest.points}" aria-label="성과 포인트" />
      </label>
      <button class="btn ghost custom-quest-remove" type="button" data-remove-custom-quest="${escapeHtml(quest.id)}">삭제</button>
    </article>
  `).join("");
}

function readCustomQuestsFromDom() {
  if (!fields.customQuestList) return [];
  const rows = [...fields.customQuestList.querySelectorAll(".custom-quest-row")];
  return rows
    .map((row, index) => ({
      id: row.dataset.questId || `custom-${index + 1}`,
      title: row.querySelector("[data-field='title']")?.value.trim() || "",
      points: clampPerformancePoints(row.querySelector("[data-field='points']")?.value),
      enabled: row.querySelector("[data-field='enabled']")?.checked ?? true,
    }))
    .filter((quest) => quest.title);
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
  const normalized = source
    .map((item, index) => ({
      id: String(item?.id || fallback[index]?.id || `${role}-${index + 1}`).trim(),
      role,
      areaId: String(item?.areaId || fallback[index]?.areaId || "").trim(),
      ko: String(item?.ko || item?.label || item?.name || fallback[index]?.ko || "").trim(),
      vi: String(item?.vi || item?.labelVi || item?.ko || item?.label || fallback[index]?.vi || "").trim(),
      xp: clampPerformancePoints(item?.xp ?? item?.points ?? fallback[index]?.xp ?? 1),
      max: 1,
      enabled: toBoolean(item?.enabled, true),
    }))
    .filter((item) => item.id && item.ko);
  if (Array.isArray(list)) return normalized;
  return normalized.length ? normalized : fallback.map((item) => ({ ...item, role, enabled: toBoolean(item.enabled, true) }));
}

function renderPerformanceSettings() {
  if (!fields.rolePerformanceSettings) return;
  const performanceItems = normalizePerformanceItems(settings.performanceItems);
  fields.rolePerformanceSettings.innerHTML = `
    <div class="role-performance-tabs" role="tablist" aria-label="역할 선택">
      ${Object.keys(performanceItems).map((role) => `
        <button class="${role === activeRoleSettingsTab ? "is-active" : ""}" type="button" role="tab" aria-selected="${role === activeRoleSettingsTab ? "true" : "false"}" data-performance-role-tab="${escapeHtml(role)}">
          ${escapeHtml(rolePerformanceLabels[role] || role)}
        </button>
      `).join("")}
    </div>
    ${Object.entries(performanceItems).map(([role, items]) => `
    <section class="role-performance-group" data-role="${escapeHtml(role)}">
      <div class="role-performance-head">
        <strong>${escapeHtml(rolePerformanceLabels[role] || role)}</strong>
        <button class="btn ghost custom-quest-add" type="button" data-add-performance-role="${escapeHtml(role)}">+ 성과 추가</button>
      </div>
      <div class="role-performance-list">
        ${items.map((item) => `
          <article class="role-performance-row" data-item-id="${escapeHtml(item.id)}" data-area-id="${escapeHtml(item.areaId || "")}">
            <label class="custom-quest-toggle">
              <input type="checkbox" data-field="enabled" ${item.enabled !== false ? "checked" : ""} />
              <span>${item.enabled !== false ? "ON" : "OFF"}</span>
            </label>
            <label>
              성과 이름
              <input type="text" data-field="ko" value="${escapeHtml(item.ko)}" placeholder="예: 리뷰 사진 인증" />
            </label>
            <label>
              성과 포인트
              <input type="number" data-field="xp" min="1" max="99" step="1" value="${item.xp}" aria-label="성과 포인트" />
            </label>
            <button class="btn ghost custom-quest-remove" type="button" data-role="${escapeHtml(role)}" data-remove-performance-item="${escapeHtml(item.id)}">삭제</button>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("")}
  `;
  updatePerformanceRoleTabs();
}

function updatePerformanceRoleTabs() {
  if (!fields.rolePerformanceSettings) return;
  fields.rolePerformanceSettings.querySelectorAll("[data-performance-role-tab]").forEach((button) => {
    const isActive = button.dataset.performanceRoleTab === activeRoleSettingsTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  fields.rolePerformanceSettings.querySelectorAll(".role-performance-group").forEach((group) => {
    group.classList.toggle("is-active", group.dataset.role === activeRoleSettingsTab);
  });
}

function readPerformanceItemsFromDom() {
  if (!fields.rolePerformanceSettings) return normalizePerformanceItems(settings.performanceItems);
  const result = { hall: [], kitchen: [], marketer: [] };
  fields.rolePerformanceSettings.querySelectorAll(".role-performance-group").forEach((group) => {
    const role = group.dataset.role || "hall";
    result[role] = [...group.querySelectorAll(".role-performance-row")]
      .map((row, index) => {
        const ko = row.querySelector("[data-field='ko']")?.value.trim() || "";
        return {
          id: row.dataset.itemId || `${role}-${index + 1}`,
          role,
          areaId: role === "kitchen" ? (row.dataset.areaId || row.dataset.itemId || `${role}-${index + 1}`) : "",
          ko,
          vi: ko,
          xp: clampPerformancePoints(row.querySelector("[data-field='xp']")?.value),
          max: 1,
          enabled: row.querySelector("[data-field='enabled']")?.checked ?? true,
        };
      })
      .filter((item) => item.ko);
  });
  return normalizePerformanceItems(result);
}

function normalizeRankingSettings(value, performanceSource = defaultPerformanceItems) {
  const allowedIds = new Set(rankingMissionOptions(normalizePerformanceItems(performanceSource)).map((option) => option.id));
  const source = Array.isArray(value) && value.length ? value : defaultRankingSettings;
  const normalized = source
    .map((item, index) => {
      const fallback = defaultRankingSettings[index] || defaultRankingSettings[0];
      const missionIds = Array.isArray(item?.missionIds)
        ? item.missionIds
        : [item?.missionId || fallback?.missionIds?.[0] || "praise"];
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

function rankingMissionOptions(performanceItems = normalizePerformanceItems(settings.performanceItems)) {
  const roleOptions = Object.entries(performanceItems).flatMap(([role, items]) => (
    items
      .filter((item) => item.enabled !== false)
      .map((item) => ({
        id: item.id,
        label: `${rankingRoleLabels[role] || role} · ${item.ko}`,
      }))
  ));
  return [
    ...roleOptions,
    { id: "kitchen-performance", label: "주방 · 켜진 청소 성과 전체" },
    { id: "marketer-performance", label: "마케팅 · 켜진 마케팅 성과 전체" },
    { id: "praise", label: "전체 · 동료 칭찬 받은 횟수" },
  ];
}

function renderRankingSettings() {
  if (!fields.rankingSettings) return;
  const performanceItems = normalizePerformanceItems(settings.performanceItems);
  const missionOptions = rankingMissionOptions(performanceItems);
  const rankings = normalizeRankingSettings(settings.rankingSettings, performanceItems);
  fields.rankingSettings.innerHTML = `
    <div class="ranking-settings-head">
      <p>직원앱 랭킹 탭과 후보 문구에 사용할 트로피를 설정합니다. 꺼둔 성과 미션은 기준 목록에서 빠져요.</p>
      <button class="btn ghost custom-quest-add" type="button" data-add-ranking-setting>+ 랭킹 추가</button>
    </div>
    <div class="ranking-settings-list">
      ${rankings.map((item) => `
        <article class="ranking-setting-row" data-ranking-id="${escapeHtml(item.id)}">
          <label class="custom-quest-toggle">
            <input type="checkbox" data-field="enabled" ${item.enabled ? "checked" : ""} />
            <span>${item.enabled ? "ON" : "OFF"}</span>
          </label>
          <label>
            랭킹 이름
            <input type="text" data-field="title" value="${escapeHtml(item.title)}" placeholder="예: 고객감동왕" />
          </label>
          <label>
            대상 역할
            <select data-field="role">
              ${Object.entries(rankingRoleLabels).map(([role, label]) => `<option value="${role}" ${item.role === role ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
          <label>
            기준 성과 미션
            <select data-field="missionId">
              ${missionOptions.map((option) => `<option value="${escapeHtml(option.id)}" ${item.missionIds.includes(option.id) ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
            </select>
          </label>
          <label>
            직원앱 응원 문구
            <input type="text" data-field="cheer" value="${escapeHtml(item.cheer)}" placeholder="예: 이번 달 트로피에 가까워져요." />
          </label>
          <label class="ranking-trophy-check">
            <input type="checkbox" data-field="monthlyTrophy" ${item.monthlyTrophy ? "checked" : ""} />
            월간 트로피
          </label>
          <button class="btn ghost custom-quest-remove" type="button" data-remove-ranking-setting="${escapeHtml(item.id)}">삭제</button>
        </article>
      `).join("")}
    </div>
  `;
}

function readRankingSettingsFromDom() {
  if (!fields.rankingSettings) return normalizeRankingSettings(settings.rankingSettings);
  const rows = [...fields.rankingSettings.querySelectorAll(".ranking-setting-row")];
  return normalizeRankingSettings(rows.map((row, index) => ({
    id: row.dataset.rankingId || `ranking-${index + 1}`,
    title: row.querySelector("[data-field='title']")?.value.trim() || "",
    role: row.querySelector("[data-field='role']")?.value || "all",
    missionIds: [row.querySelector("[data-field='missionId']")?.value || ""],
    enabled: row.querySelector("[data-field='enabled']")?.checked ?? true,
    cheer: row.querySelector("[data-field='cheer']")?.value.trim() || "",
    monthlyTrophy: row.querySelector("[data-field='monthlyTrophy']")?.checked ?? true,
  })));
}

function parsePerformancePoints(quest) {
  if (Number.isFinite(Number(quest?.points))) return clampPerformancePoints(quest.points);
  const legacyReward = String(quest?.reward || "");
  const matched = legacyReward.match(/-?\d+/);
  return clampPerformancePoints(matched ? matched[0] : 1);
}

function clampPerformancePoints(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(99, Math.max(1, parsed));
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

function parseOperationPoints(value) {
  return normalizeOperationPoints(String(value || "").split(/\r?\n/));
}

function normalizeOperationPoints(value) {
  const source = Array.isArray(value) ? value : defaultStoreSettings.operationPoints;
  const points = source
    .map((point) => String(point || "").trim())
    .filter(Boolean)
    .slice(0, 6);
  return points.length ? points : defaultStoreSettings.operationPoints;
}

function normalizeOptionalOperationPoints(value) {
  const source = Array.isArray(value) ? value : [];
  return source
    .map((point) => String(point || "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
