const defaultStaff = [
  { id: "manager", name: "매니저", role: "매니저", type: "manager", active: false },
  { id: "kitchen-manager", name: "주방매니저", role: "주방", type: "kitchen", active: true },
  { id: "hall-a", name: "홀직원 A", role: "홀", type: "hall" },
  { id: "hall-b", name: "홀직원 B", role: "홀", type: "hall" },
  { id: "kitchen-a", name: "주방직원 A", role: "주방", type: "kitchen" },
  { id: "kitchen-b", name: "주방직원 B", role: "주방", type: "kitchen" },
  { id: "part-a", name: "파트타임 A", role: "파트타임", type: "part" },
  { id: "part-b", name: "파트타임 B", role: "파트타임", type: "part" },
];

const storageKey = "doya-kpi-levelup-v1";
const state = loadState();
const staff = normalizeStaff(state.staff);

const els = {
  form: document.querySelector("#kitchenForm"),
  date: document.querySelector("#kitchenDate"),
  quality: document.querySelector("#qualityScore"),
  speed: document.querySelector("#speedScore"),
  clean: document.querySelector("#cleanScore"),
  prep: document.querySelector("#prepScore"),
  penalty: document.querySelector("#kitchenPenalty"),
  memo: document.querySelector("#kitchenMemo"),
  monthScore: document.querySelector("#kitchenMonthScore"),
  bonusPool: document.querySelector("#kitchenBonusPool"),
  workDays: document.querySelector("#kitchenWorkDays"),
  entryCount: document.querySelector("#kitchenEntryCount"),
  attendanceEditor: document.querySelector("#kitchenAttendanceEditor"),
  splitTable: document.querySelector("#kitchenSplitTable"),
  logTable: document.querySelector("#kitchenLogTable"),
  resetBtn: document.querySelector("#kitchenResetBtn"),
  exportBtn: document.querySelector("#kitchenExportBtn"),
};

I18N.apply();
I18N.bind(render);

els.date.value = toInputDate(new Date());
els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  addKitchenEntry();
});
els.resetBtn.addEventListener("click", resetKitchenEntries);
els.exportBtn.addEventListener("click", exportKitchenCsv);
els.attendanceEditor.addEventListener("input", updateKitchenAttendance);

render();

function loadState() {
  const fallback = {
    entries: [],
    kitchenEntries: [],
    kitchenAttendance: {},
    staff: defaultStaff,
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(storageKey)) };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function normalizeStaff(savedStaff) {
  if (Array.isArray(savedStaff) && savedStaff.some((person) => !defaultStaff.some((defaultPerson) => defaultPerson.id === person.id))) {
    return savedStaff.map((person) => ({
      ...person,
      type: getTypeForRole(person.role, person.type),
      active: person.id === "manager" ? false : person.active ?? true,
    }));
  }

  const savedMap = new Map((savedStaff || []).map((person) => [person.id, person]));
  return defaultStaff.map((person) => ({
    ...person,
    ...savedMap.get(person.id),
    type: getTypeForRole(savedMap.get(person.id)?.role ?? person.role, savedMap.get(person.id)?.type ?? person.type),
    active: person.id === "manager" ? false : savedMap.get(person.id)?.active ?? person.active ?? true,
  }));
}

function getKitchenStaff() {
  return staff.filter((person) => person.active !== false && person.type === "kitchen");
}

function addKitchenEntry() {
  const entry = {
    id: crypto.randomUUID(),
    date: els.date.value,
    quality: clamp(readNumber(els.quality), 0, 35),
    speed: clamp(readNumber(els.speed), 0, 25),
    clean: clamp(readNumber(els.clean), 0, 25),
    prep: clamp(readNumber(els.prep), 0, 15),
    penalty: readNumber(els.penalty),
    memo: els.memo.value.trim(),
  };
  entry.total = getKitchenTotal(entry);
  state.kitchenEntries = [...(state.kitchenEntries || []), entry];
  saveState();
  els.form.reset();
  els.date.value = entry.date;
  els.quality.value = 30;
  els.speed.value = 20;
  els.clean.value = 22;
  els.prep.value = 12;
  els.penalty.value = 0;
  render();
}

function render() {
  I18N.apply();
  const monthEntries = getMonthKitchenEntries();
  const monthScore = monthEntries.length ? average(monthEntries.map((entry) => getKitchenTotal(entry))) : 0;
  const bonusPool = getKitchenBonusPool(monthScore);
  const splitRows = buildKitchenSplit(bonusPool);
  const totalKitchenDays = splitRows.reduce((sum, row) => sum + row.workedDays, 0);

  els.monthScore.textContent = formatScore(monthScore);
  els.bonusPool.textContent = formatVnd(bonusPool);
  els.workDays.textContent = I18N.getLang() === "vi" ? `${totalKitchenDays} ngày` : `${totalKitchenDays}일`;
  els.entryCount.textContent = I18N.getLang() === "vi" ? `${monthEntries.length} lần` : `${monthEntries.length}개`;
  renderKitchenSplit(splitRows);
  renderKitchenAttendance(splitRows);
  renderKitchenLog(monthEntries);
}

function getMonthKitchenEntries() {
  const month = toInputDate(new Date()).slice(0, 7);
  return (state.kitchenEntries || []).filter((entry) => entry.date?.slice(0, 7) === month);
}

function buildKitchenSplit(bonusPool) {
  const month = toInputDate(new Date()).slice(0, 7);
  const attendance = state.kitchenAttendance?.[month] || {};
  const kitchenStaff = getKitchenStaff();
  const rows = kitchenStaff.map((person) => {
    const workedDays = Number(attendance[person.id] || 0);
    return { ...person, workedDays };
  });
  const totalDays = rows.reduce((sum, row) => sum + row.workedDays, 0);
  return rows.map((row) => ({
    ...row,
    bonus: totalDays ? Math.round((bonusPool * row.workedDays) / totalDays) : 0,
  }));
}

function renderKitchenAttendance(rows) {
  if (!rows.length) {
    els.attendanceEditor.innerHTML = "";
    return;
  }
  els.attendanceEditor.innerHTML = rows.map((row) => `
    <label>
      <span>${row.name} · ${I18N.role(row.role)}</span>
      <input data-kitchen-staff-id="${row.id}" type="number" min="0" value="${row.workedDays}" />
    </label>
  `).join("");
}

function updateKitchenAttendance(event) {
  const staffId = event.target.dataset.kitchenStaffId;
  if (!staffId) return;
  const month = toInputDate(new Date()).slice(0, 7);
  state.kitchenAttendance = state.kitchenAttendance || {};
  state.kitchenAttendance[month] = state.kitchenAttendance[month] || {};
  state.kitchenAttendance[month][staffId] = Number(event.target.value || 0);
  saveState();
  render();
}

function renderKitchenSplit(rows) {
  if (!rows.length) {
    els.splitTable.innerHTML = `<tr><td colspan="4">${I18N.t("kitchenNoStaff")}</td></tr>`;
    return;
  }
  els.splitTable.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.name}</td>
      <td>${I18N.role(row.role)}</td>
      <td>${row.workedDays}</td>
      <td>${formatVnd(row.bonus)}</td>
    </tr>
  `).join("");
}

function renderKitchenLog(rows) {
  const recentRows = [...rows].reverse().slice(0, 20);
  if (!recentRows.length) {
    els.logTable.innerHTML = `<tr><td colspan="8">${I18N.t("emptyLog")}</td></tr>`;
    return;
  }
  els.logTable.innerHTML = recentRows.map((entry) => `
    <tr>
      <td>${entry.date}</td>
      <td>${entry.quality}</td>
      <td>${entry.speed}</td>
      <td>${entry.clean}</td>
      <td>${entry.prep}</td>
      <td>${entry.penalty}</td>
      <td>${formatScore(getKitchenTotal(entry))}</td>
      <td>${escapeHtml(entry.memo || "-")}</td>
    </tr>
  `).join("");
}

function getKitchenTotal(entry) {
  return clamp(Number(entry.quality || 0) + Number(entry.speed || 0) + Number(entry.clean || 0) + Number(entry.prep || 0) - Number(entry.penalty || 0), 0, 100);
}

function getKitchenBonusPool(score) {
  if (score >= 95) return 3000000;
  if (score >= 90) return 2000000;
  if (score >= 85) return 1200000;
  if (score >= 80) return 700000;
  return 0;
}

function resetKitchenEntries() {
  if (!confirm(I18N.t("kitchenResetConfirm"))) return;
  state.kitchenEntries = [];
  saveState();
  render();
}

function exportKitchenCsv() {
  const header = ["date", "quality", "speed", "clean", "prep", "penalty", "total", "memo"];
  const lines = (state.kitchenEntries || []).map((entry) => [
    entry.date,
    entry.quality,
    entry.speed,
    entry.clean,
    entry.prep,
    entry.penalty,
    getKitchenTotal(entry),
    `"${String(entry.memo || "").replaceAll("\"", "\"\"")}"`,
  ].join(","));
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `doya-kitchen-${toInputDate(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getTypeForRole(role, fallback = "hall") {
  if (role === "주방") return "kitchen";
  if (role === "파트타임") return "part";
  if (role === "매니저") return "manager";
  return fallback === "manager" ? "hall" : "hall";
}

function readNumber(input) {
  return Number(input.value || 0);
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function average(numbers) {
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatScore(value) {
  return I18N.t("points", { value: Number(value || 0).toFixed(1).replace(".0", "") });
}

function formatVnd(value) {
  return I18N.t("currency", { value: Math.round(value || 0).toLocaleString("vi-VN") });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
