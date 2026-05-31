const storageKey = "doya-kpi-levelup-v2";

const defaultStaff = [
  { id: "hall-manager", name: "홀 매니저", role: "hall-manager", active: true },
  { id: "hall-a", name: "홀직원 A", role: "hall", active: true },
  { id: "hall-b", name: "홀직원 B", role: "hall", active: true },
  { id: "kitchen-manager", name: "주방 매니저", role: "kitchen-manager", active: true },
  { id: "kitchen-a", name: "주방직원 A", role: "kitchen", active: true },
  { id: "kitchen-b", name: "주방직원 B", role: "kitchen", active: true },
];

const oldDefaultBonusSettings = {
  kpiTopThreshold: 9.5,
  kpiTopBonus: 700000,
  kpiGoodThreshold: 9,
  kpiGoodBonus: 300000,
  kpiMinimumThreshold: 8.5,
  pointBaseThreshold: 60,
  pointBaseBonus: 300000,
  pointGoodThreshold: 100,
  pointGoodBonus: 500000,
  pointTopThreshold: 150,
  pointTopBonus: 700000,
  teamTopThreshold: 9,
  teamTopBonus: 700000,
  teamGoodThreshold: 8,
  teamGoodBonus: 300000,
  salesBaseAmount: 500000000,
  salesBaseBonus: 300000,
  salesStepAmount: 50000000,
  salesStepBonus: 300000,
  managerSalesBaseAmount: 500000000,
  managerSalesBaseBonus: 700000,
  managerSalesStepAmount: 50000000,
  managerSalesStepBonus: 700000,
  partTimeRate: 0.5,
};

const bonusPresets = {
  conservative: {
    name: "보수적",
    description: "처음 1~2개월 테스트용. 보너스 총액을 안정적으로 관리합니다.",
    settings: {
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
    },
  },
  standard: {
    name: "보통",
    description: "동기부여와 비용 사이 균형형. 운영이 안정되면 쓰기 좋습니다.",
    settings: {
      kpiTopThreshold: 9.5,
      kpiTopBonus: 700000,
      kpiGoodThreshold: 9,
      kpiGoodBonus: 300000,
      kpiMinimumThreshold: 8.5,
      pointBaseThreshold: 60,
      pointBaseBonus: 300000,
      pointGoodThreshold: 100,
      pointGoodBonus: 500000,
      pointTopThreshold: 150,
      pointTopBonus: 700000,
      teamTopThreshold: 9,
      teamTopBonus: 700000,
      teamGoodThreshold: 8,
      teamGoodBonus: 300000,
      salesBaseAmount: 500000000,
      salesBaseBonus: 300000,
      salesStepAmount: 50000000,
      salesStepBonus: 300000,
      managerSalesBaseAmount: 500000000,
      managerSalesBaseBonus: 700000,
      managerSalesStepAmount: 50000000,
      managerSalesStepBonus: 700000,
      partTimeRate: 0.5,
    },
  },
  aggressive: {
    name: "공격적",
    description: "매출 성장 압박을 강하게 줄 때. 전체 보너스 예산 확인이 필요합니다.",
    settings: {
      kpiTopThreshold: 9.5,
      kpiTopBonus: 1000000,
      kpiGoodThreshold: 9,
      kpiGoodBonus: 500000,
      kpiMinimumThreshold: 8.5,
      pointBaseThreshold: 60,
      pointBaseBonus: 500000,
      pointGoodThreshold: 100,
      pointGoodBonus: 700000,
      pointTopThreshold: 150,
      pointTopBonus: 1000000,
      teamTopThreshold: 9,
      teamTopBonus: 1000000,
      teamGoodThreshold: 8,
      teamGoodBonus: 500000,
      salesBaseAmount: 500000000,
      salesBaseBonus: 500000,
      salesStepAmount: 50000000,
      salesStepBonus: 400000,
      managerSalesBaseAmount: 500000000,
      managerSalesBaseBonus: 700000,
      managerSalesStepAmount: 50000000,
      managerSalesStepBonus: 700000,
      partTimeRate: 0.5,
    },
  },
};

const defaultBonusSettings = bonusPresets.conservative.settings;
const form = document.querySelector("#bonusSettingsForm");
const resetButton = document.querySelector("#resetBonusSettingsBtn");
const presetGrid = document.querySelector("#presetGrid");
const seedButton = document.querySelector("#seedBtn");
const resetDataButton = document.querySelector("#resetBtn");
const fields = Object.keys(defaultBonusSettings).filter((key) => key !== "partTimeRate");

let state = loadState();
let settings = normalizeBonusSettings(state.bonusSettings);
let selectedPreset = detectPreset(settings);

if (selectedPreset === "standard" && settingsEqual(settings, oldDefaultBonusSettings)) {
  settings = { ...defaultBonusSettings };
  selectedPreset = "conservative";
  saveSettings(false);
}

renderPresets();
renderSettings();
syncCloudState();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  settings = readSettings();
  selectedPreset = detectPreset(settings);
  saveSettings(true);
  renderPresets();
});

resetButton.addEventListener("click", () => {
  if (!confirm("보너스 설정을 보수적 기본값으로 복원할까요?")) return;
  settings = { ...defaultBonusSettings };
  selectedPreset = "conservative";
  saveSettings(false);
  renderSettings();
  renderPresets();
});

presetGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button) return;
  const preset = button.dataset.preset;
  selectedPreset = preset;
  if (bonusPresets[preset]) {
    settings = { ...bonusPresets[preset].settings };
    renderSettings();
  } else {
    settings = readSettings();
  }
  renderPresets();
});

form.addEventListener("input", () => {
  selectedPreset = "custom";
  renderPresets();
});

seedButton.addEventListener("click", seedData);
resetDataButton.addEventListener("click", resetData);

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function normalizeBonusSettings(savedSettings) {
  return { ...defaultBonusSettings, ...(savedSettings || {}) };
}

function renderPresets() {
  const presetCards = Object.entries(bonusPresets).map(([key, preset]) => `
    <button class="preset-card ${selectedPreset === key ? "is-active" : ""}" type="button" data-preset="${key}">
      <strong>${preset.name}</strong>
      <span>${preset.description}</span>
      <small>KPI 최고 ${formatVnd(preset.settings.kpiTopBonus)} · 팀 최고 ${formatVnd(preset.settings.teamTopBonus)}</small>
    </button>
  `).join("");

  presetGrid.innerHTML = `
    ${presetCards}
    <button class="preset-card ${selectedPreset === "custom" ? "is-active" : ""}" type="button" data-preset="custom">
      <strong>임의세팅</strong>
      <span>아래 숫자를 직접 바꿔서 우리 매장 기준에 맞춥니다.</span>
      <small>저장 전까지 현재 입력값 유지</small>
    </button>
  `;
}

function renderSettings() {
  fields.forEach((field) => {
    document.getElementById(field).value = settings[field];
  });
  document.getElementById("partTimeRatePercent").value = Math.round(Number(settings.partTimeRate || 0) * 100);
}

function readSettings() {
  const nextSettings = { ...defaultBonusSettings };
  fields.forEach((field) => {
    nextSettings[field] = readNumber(document.getElementById(field));
  });
  nextSettings.partTimeRate = readNumber(document.getElementById("partTimeRatePercent")) / 100;
  return nextSettings;
}

function saveSettings(showAlert) {
  state.bonusSettings = settings;
  saveStateEverywhere(state);
  if (showAlert) alert("보너스 설정을 저장했습니다.");
}

function seedData() {
  const confirmText = prompt("샘플 데이터는 현재 KPI 기록을 덮어씁니다. 계속하려면 '샘플'이라고 입력하세요.");
  if (confirmText !== "샘플") return;

  const staff = normalizeStaff(state.staff);
  const today = new Date();
  const personalEntries = [];
  const teamEntries = [];
  for (let dayOffset = 0; dayOffset < 18; dayOffset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    activeStaff(staff).forEach((person, index) => {
      personalEntries.push(samplePersonalEntry(person, toInputDate(date), dayOffset, index));
    });
    teamEntries.push(sampleTeamEntry("hall", toInputDate(date), dayOffset));
    teamEntries.push(sampleTeamEntry("kitchen", toInputDate(date), dayOffset + 1));
  }

  state.staff = staff;
  state.personalEntries = personalEntries;
  state.teamEntries = teamEntries;
  state.selfChecks = [];
  state.monthlySales = state.monthlySales || 560000000;
  state.bonusSettings = settings;
  saveStateEverywhere(state);
  alert("샘플 데이터를 넣었습니다. KPI 화면에서 확인할 수 있습니다.");
}

function resetData() {
  const confirmText = prompt("개인 KPI 기록과 팀 KPI 기록을 모두 삭제합니다. 계속하려면 '초기화'라고 입력하세요.");
  if (confirmText !== "초기화") return;

  state.personalEntries = [];
  state.teamEntries = [];
  state.selfChecks = [];
  state.bonusSettings = settings;
  saveStateEverywhere(state);
  alert("KPI 기록을 초기화했습니다. 직원 목록과 보너스 설정은 유지됩니다.");
}

async function syncCloudState() {
  try {
    const cloudState = await loadStateFromCloud();
    if (!cloudState) return;
    state = { ...state, ...cloudState };
    settings = normalizeBonusSettings(state.bonusSettings);
    selectedPreset = detectPreset(settings);
    localStorage.setItem(storageKey, JSON.stringify(state));
    renderSettings();
    renderPresets();
  } catch (error) {
    console.warn(error);
  }
}

function detectPreset(currentSettings) {
  const match = Object.entries(bonusPresets).find(([, preset]) => settingsEqual(currentSettings, preset.settings));
  return match ? match[0] : "custom";
}

function settingsEqual(left, right) {
  return Object.keys(defaultBonusSettings).every((key) => Number(left?.[key]) === Number(right?.[key]));
}

function readNumber(input) {
  return Number(input?.value || 0);
}

function normalizeStaff(savedStaff) {
  const source = Array.isArray(savedStaff) && savedStaff.length ? savedStaff : defaultStaff;
  return source.map((person) => ({
    ...person,
    role: normalizeRole(person.role),
    active: person.active !== false,
  }));
}

function normalizeRole(role) {
  const validRoles = ["hall-manager", "hall", "hall-part", "kitchen-manager", "kitchen", "kitchen-part"];
  return validRoles.includes(role) ? role : "hall";
}

function activeStaff(staff) {
  return staff.filter((person) => person.active !== false);
}

function samplePersonalEntry(person, date, dayOffset, index) {
  const kitchen = isKitchenRole(person.role);
  return {
    id: uniqueId(),
    date,
    staffId: person.id,
    role: person.role,
    worked: dayOffset % 7 === index % 7 ? 0 : 1,
    late: (dayOffset + index) % 17 === 0 ? 1 : 0,
    orderMiss: !kitchen && (dayOffset + index) % 13 === 0 ? 1 : 0,
    posMistake: !kitchen && (dayOffset + index) % 19 === 0 ? 1 : 0,
    unkind: 0,
    complaint: (dayOffset + index) % 23 === 0 ? 1 : 0,
    attitudeIssue: 0,
    phoneOveruse: !kitchen && (dayOffset + index) % 29 === 0 ? 1 : 0,
    handoffMiss: !kitchen && (dayOffset + index) % 11 === 0 ? 1 : 0,
    cookDelay: kitchen && (dayOffset + index) % 12 === 0 ? 1 : 0,
    waste: kitchen && (dayOffset + index) % 10 === 0 ? 1 : 0,
    hygieneIssue: kitchen && (dayOffset + index) % 18 === 0 ? 1 : 0,
    membershipLead: !kitchen && (dayOffset + index) % 11 === 0 ? 1 : 0,
    teamHelp: (dayOffset + index) % 13 === 0 ? 1 : 0,
    reviewRequest: !kitchen && (dayOffset + index) % 10 === 0 ? 1 : 0,
    upsellLead: !kitchen && (dayOffset + index) % 9 === 0 ? 1 : 0,
    peakStable: kitchen && (dayOffset + index) % 14 === 0 ? 1 : 0,
    hygieneGood: kitchen && (dayOffset + index) % 12 === 0 ? 1 : 0,
    stockGood: kitchen && (dayOffset + index) % 13 === 0 ? 1 : 0,
    upsellPoint: !kitchen ? (dayOffset + index) % 2 : 0,
    membershipPoint: !kitchen && (dayOffset + index) % 5 === 0 ? 1 : 0,
    reviewPoint: !kitchen && (dayOffset + index) % 3 === 0 ? 1 : 0,
    praisePoint: !kitchen && (dayOffset + index) % 7 === 0 ? 1 : 0,
    recommendedMenuPoint: !kitchen && (dayOffset + index) % 4 === 0 ? 1 : 0,
  };
}

function sampleTeamEntry(team, date, seed) {
  return {
    id: uniqueId(),
    date,
    team,
    item1: seed % 8 === 0 ? 1 : 2,
    item2: seed % 6 === 0 ? 1 : 2,
    item3: seed % 9 === 0 ? 1 : 2,
    item4: seed % 7 === 0 ? 1 : 2,
    item5: seed % 5 === 0 ? 1 : 2,
    memo: "",
  };
}

function isKitchenRole(role) {
  return role === "kitchen" || role === "kitchen-manager" || role === "kitchen-part";
}

function uniqueId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatVnd(value) {
  return `${Math.round(value || 0).toLocaleString("ko-KR")}원`;
}
