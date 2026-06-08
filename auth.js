const leveloveAuthStorageKey = "levelove-auth-v1";
const leveloveAuthSessionKey = "levelove-auth-session-v1";
const leveloveAuthCloudId = "auth:levelove";
const leveloveLastTestKey = "levelove-last-test-store-v1";
const leveloveDefaultStoreId = "store_mpr0b4hw_ru2t0xt";
const leveloveArchivedStoreIds = new Set([
  "store_test_metrics",
  "store_team_restore",
  "store_mpqx4svm_yythxv4",
  "store_mptkxnqv_uuoqamc",
  "store_mpnybncn_1bxy2ty",
  "store_mpp9adqs_x7lrsin",
  "store_mpr0023n_dizxbs2",
]);

(function initLeveloveAuth() {
  const publicPages = ["auth.html", "index.html", "staff.html", "levelove-staff-9c4f2a7.html"];
  const params = new URLSearchParams(window.location.search);
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  let authHydratePromise = null;
  let authHydrated = false;

  function loadAuthState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(leveloveAuthStorageKey) || "{}");
      return normalizeAuthState(parsed);
    } catch {
      return normalizeAuthState({});
    }
  }

  function normalizeAuthState(value) {
    return {
      stores: Array.isArray(value?.stores) ? value.stores : [],
      users: Array.isArray(value?.users) ? value.users : [],
      invites: Array.isArray(value?.invites) ? value.invites : [],
      canonicalStoreId: String(value?.canonicalStoreId || ""),
      cleanupVersion: String(value?.cleanupVersion || ""),
      updatedAt: value?.updatedAt || "",
    };
  }

  function saveAuthState(nextState) {
    const normalized = normalizeAuthState({
      ...nextState,
      updatedAt: nextState?.updatedAt || new Date().toISOString(),
    });
    localStorage.setItem(leveloveAuthStorageKey, JSON.stringify(normalized));
    saveAuthStateToCloud(normalized).catch((error) => console.warn(error));
  }

  function authCloudConfig() {
    const config = window.DOYA_SUPABASE || {};
    return {
      url: String(config.url || "").replace(/\/$/, ""),
      anonKey: String(config.anonKey || ""),
    };
  }

  function authCloudEnabled() {
    const config = authCloudConfig();
    return Boolean(config.url && config.anonKey);
  }

  function authCloudHeaders(config) {
    return {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    };
  }

  async function loadAuthStateFromCloud() {
    if (!authCloudEnabled()) return null;
    const config = authCloudConfig();
    const response = await fetch(`${config.url}/rest/v1/doya_app_state?id=eq.${encodeURIComponent(leveloveAuthCloudId)}&select=data`, {
      headers: authCloudHeaders(config),
    });
    if (!response.ok) throw new Error("계정 정보를 불러오지 못했습니다.");
    const rows = await response.json();
    return rows[0]?.data || null;
  }

  async function saveAuthStateToCloud(nextState) {
    if (!authCloudEnabled()) return;
    const config = authCloudConfig();
    const response = await fetch(`${config.url}/rest/v1/doya_app_state`, {
      method: "POST",
      headers: {
        ...authCloudHeaders(config),
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: leveloveAuthCloudId,
        data: {
          ...normalizeAuthState(nextState),
          updatedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error("계정 정보를 저장하지 못했습니다.");
  }

  function mergeByKey(localItems, cloudItems, keyFn) {
    const map = new Map();
    [...(Array.isArray(cloudItems) ? cloudItems : []), ...(Array.isArray(localItems) ? localItems : [])].forEach((item) => {
      const key = keyFn(item);
      if (key) map.set(key, { ...(map.get(key) || {}), ...item });
    });
    return [...map.values()];
  }

  function mergeAuthStates(localState, cloudState) {
    const local = normalizeAuthState(localState);
    const cloud = normalizeAuthState(cloudState);
    return normalizeAuthState({
      stores: mergeByKey(local.stores, cloud.stores, (store) => store?.id),
      users: mergeByKey(local.users, cloud.users, (user) => normalizeEmail(user?.email) || user?.id),
      invites: mergeByKey(local.invites, cloud.invites, (invite) => invite?.code || invite?.id),
      canonicalStoreId: local.canonicalStoreId || cloud.canonicalStoreId || "",
      cleanupVersion: local.cleanupVersion || cloud.cleanupVersion || "",
      updatedAt: [local.updatedAt, cloud.updatedAt, new Date().toISOString()].filter(Boolean).sort().pop(),
    });
  }

  function hydrateAuthStateFromCloud() {
    if (authHydrated) return Promise.resolve(false);
    if (authHydratePromise) return authHydratePromise;
    authHydratePromise = loadAuthStateFromCloud()
      .then((cloudState) => {
        authHydrated = true;
        if (!cloudState) return false;
        const localState = loadAuthState();
        const merged = mergeAuthStates(localState, cloudState);
        const before = JSON.stringify(localState);
        const after = JSON.stringify(merged);
        if (before !== after) {
          saveAuthState(merged);
          return true;
        }
        return false;
      })
      .catch((error) => {
        authHydrated = true;
        console.warn(error);
        return false;
      });
    return authHydratePromise;
  }

  function session() {
    try {
      return JSON.parse(localStorage.getItem(leveloveAuthSessionKey) || "null");
    } catch {
      return null;
    }
  }

  function setSession(nextSession) {
    if (!nextSession) {
      localStorage.removeItem(leveloveAuthSessionKey);
      return;
    }
    localStorage.setItem(leveloveAuthSessionKey, JSON.stringify({
      ...nextSession,
      signedInAt: new Date().toISOString(),
    }));
  }

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function encodePassword(password, salt) {
    return btoa(unescape(encodeURIComponent(`${salt}:${password}`)));
  }

  function slug(value) {
    return String(value || "staff")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "staff";
  }

  function roleLabel(role) {
    return {
      owner: "사장님",
      admin: "관리자",
      manager: "매니저",
      employee: "직원",
    }[role] || "직원";
  }

  function storeForSession(activeSession = session()) {
    const authState = loadAuthState();
    return authState.stores.find((store) => store.id === activeSession?.storeId) || null;
  }

  function userForSession(activeSession = session()) {
    const authState = loadAuthState();
    return authState.users.find((user) => user.id === activeSession?.userId) || null;
  }

  function signUpOwner({ ownerName, storeName, email, password }) {
    const authState = loadAuthState();
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password || !storeName) throw new Error("매장명, 이메일, 비밀번호를 입력해주세요.");
    if (authState.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      throw new Error("이미 가입된 이메일입니다. 로그인으로 들어가주세요.");
    }
    const store = {
      id: uid("store"),
      name: String(storeName || "우리 매장").trim(),
      ownerName: String(ownerName || "사장님").trim(),
      createdAt: new Date().toISOString(),
    };
    const salt = uid("salt");
    const user = {
      id: uid("user"),
      storeId: store.id,
      name: String(ownerName || "사장님").trim(),
      email: normalizedEmail,
      role: "owner",
      salt,
      passwordHash: encodePassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    authState.stores.push(store);
    authState.users.push(user);
    authState.updatedAt = new Date().toISOString();
    saveAuthState(authState);
    setSession({ userId: user.id, storeId: store.id, role: user.role });
    return { store, user };
  }

  function signIn(email, password) {
    const authState = loadAuthState();
    const normalizedEmail = normalizeEmail(email);
    const user = authState.users.find((item) => normalizeEmail(item.email) === normalizedEmail);
    if (!user || user.passwordHash !== encodePassword(password, user.salt)) {
      throw new Error("이메일 또는 비밀번호가 맞지 않습니다.");
    }
    setSession({ userId: user.id, storeId: user.storeId, role: user.role, staffId: user.staffId || "" });
    return user;
  }

  function signOut() {
    setSession(null);
    window.location.href = "auth.html";
  }

  function canManage(role) {
    return ["owner", "admin", "manager"].includes(role);
  }

  function createInvite({ staffName, accessRole, staffRole }) {
    const activeSession = session();
    const user = userForSession(activeSession);
    if (!canManage(user?.role)) throw new Error("초대 권한이 없습니다.");
    const authState = loadAuthState();
    const invite = {
      id: uid("invite"),
      code: uid("lv").replace("lv_", ""),
      storeId: activeSession.storeId,
      staffName: String(staffName || "새 직원").trim(),
      accessRole: accessRole || "employee",
      staffRole: staffRole || "hall",
      staffId: `${staffRole || "staff"}-${slug(staffName)}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      usedBy: "",
    };
    authState.invites.push(invite);
    authState.updatedAt = new Date().toISOString();
    saveAuthState(authState);
    return invite;
  }

  function createTestStore() {
    const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(4, 14);
    const credentials = {
      storeName: `테스트 매장 ${stamp}`,
      ownerName: "테스트 사장님",
      email: `owner.${stamp}@levelove.test`,
      password: "test1234",
    };
    const result = signUpOwner(credentials);
    const staffSeeds = [
      { staffName: "홀직원 A", accessRole: "employee", staffRole: "hall" },
      { staffName: "홀직원 B", accessRole: "employee", staffRole: "hall" },
      { staffName: "주방직원 A", accessRole: "employee", staffRole: "kitchen" },
      { staffName: "마케터 A", accessRole: "employee", staffRole: "marketer" },
      { staffName: "매니저 A", accessRole: "manager", staffRole: "manager" },
    ];
    const invites = staffSeeds.map((seed) => createInvite(seed));
    const testInfo = {
      ...credentials,
      storeId: result.store.id,
      createdAt: new Date().toISOString(),
      invites: invites.map((invite) => ({
        staffName: invite.staffName,
        staffRole: invite.staffRole,
        accessRole: invite.accessRole,
        url: inviteUrl(invite),
      })),
    };
    localStorage.setItem(leveloveLastTestKey, JSON.stringify(testInfo));
    return testInfo;
  }

  function fallbackInviteFromUrl(authState, code) {
    const storeId = params.get("store") || "";
    const staffName = params.get("staffName") || "";
    if (!code || !storeId || !staffName) return null;
    if (!authState.stores.some((store) => store.id === storeId)) {
      authState.stores.push({
        id: storeId,
        name: params.get("storeName") || "테스트 매장",
        ownerName: "초대 생성자",
        createdAt: new Date().toISOString(),
      });
    }
    const invite = {
      id: uid("invite"),
      code,
      storeId,
      staffName,
      accessRole: params.get("accessRole") || "employee",
      staffRole: params.get("staffRole") || "hall",
      staffId: params.get("staffId") || `${params.get("staffRole") || "staff"}-${slug(staffName)}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      usedBy: "",
      localFallback: true,
    };
    authState.invites.push(invite);
    authState.updatedAt = new Date().toISOString();
    saveAuthState(authState);
    return invite;
  }

  function acceptInvite({ code, name, email, password }) {
    const authState = loadAuthState();
    const invite = authState.invites.find((item) => item.code === code) || fallbackInviteFromUrl(authState, code);
    if (!invite) throw new Error("초대 링크를 찾을 수 없습니다.");
    if (invite.usedBy) throw new Error("이미 사용한 초대 링크입니다.");
    if (new Date(invite.expiresAt).getTime() < Date.now()) throw new Error("만료된 초대 링크입니다.");
    const normalizedEmail = normalizeEmail(email);
    if (authState.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      throw new Error("이미 가입된 이메일입니다. 로그인으로 들어가주세요.");
    }
    const salt = uid("salt");
    const user = {
      id: uid("user"),
      storeId: invite.storeId,
      staffId: invite.staffId,
      staffRole: invite.staffRole,
      name: String(name || invite.staffName || "직원").trim(),
      email: normalizedEmail,
      role: invite.accessRole || "employee",
      salt,
      passwordHash: encodePassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    invite.usedBy = user.id;
    invite.usedAt = new Date().toISOString();
    authState.users.push(user);
    authState.updatedAt = new Date().toISOString();
    saveAuthState(authState);
    setSession({ userId: user.id, storeId: user.storeId, role: user.role, staffId: user.staffId });
    return user;
  }

  function storeIdFromUrl() {
    return params.get("store") || params.get("storeId") || "";
  }

  function canonicalStoreId(authState = loadAuthState()) {
    return authState.canonicalStoreId || leveloveDefaultStoreId || "";
  }

  function activeStoreId() {
    const authState = loadAuthState();
    const canonicalId = canonicalStoreId(authState);
    const explicitStoreId = storeIdFromUrl();
    if (explicitStoreId) {
      if (canonicalId && leveloveArchivedStoreIds.has(explicitStoreId)) return canonicalId;
      return explicitStoreId;
    }
    const activeSession = session();
    return activeSession?.storeId || canonicalId || "main";
  }

  function storeStateId() {
    const storeId = activeStoreId();
    return storeId && storeId !== "main" ? `store:${storeId}` : "main";
  }

  function stateStorageKey(baseKey) {
    const storeId = activeStoreId();
    const key = storeId && storeId !== "main" ? `${baseKey}:${storeId}` : baseKey;
    if (shouldMigrateLegacyState(storeId)) migrateLegacyStateStorage(baseKey, key, storeId);
    return key;
  }

  function shouldMigrateLegacyState(targetStoreId) {
    const legacyStoreId = storeIdFromUrl();
    if (!legacyStoreId || !targetStoreId || legacyStoreId === targetStoreId) return false;
    return leveloveArchivedStoreIds.has(legacyStoreId);
  }

  function migrateLegacyStateStorage(baseKey, targetKey, targetStoreId) {
    const legacyStoreId = storeIdFromUrl();
    if (!legacyStoreId || legacyStoreId === targetStoreId) return;
    const legacyKey = legacyStoreId && legacyStoreId !== "main" ? `${baseKey}:${legacyStoreId}` : baseKey;
    if (!legacyKey || legacyKey === targetKey || localStorage.getItem(`${legacyKey}:migrated:${targetStoreId}`)) return;
    const legacyRaw = localStorage.getItem(legacyKey);
    if (!legacyRaw) return;
    try {
      const current = JSON.parse(localStorage.getItem(targetKey) || "{}");
      const legacy = JSON.parse(legacyRaw);
      const merged = {
        ...current,
        selfChecks: mergeRecordList(current.selfChecks, legacy.selfChecks, (entry) => (
          entry?.id || `${entry?.date || ""}:${entry?.staffId || ""}:${entry?.status || ""}`
        )),
        analyticsEvents: mergeRecordList(current.analyticsEvents, legacy.analyticsEvents, (entry) => entry?.id),
      };
      localStorage.setItem(targetKey, JSON.stringify(merged));
      localStorage.setItem(`${legacyKey}:migrated:${targetStoreId}`, "1");
    } catch (error) {
      console.warn(error);
    }
  }

  function mergeRecordList(currentItems, legacyItems, keyFn) {
    const map = new Map();
    [...(Array.isArray(currentItems) ? currentItems : []), ...(Array.isArray(legacyItems) ? legacyItems : [])].forEach((item, index) => {
      const key = keyFn(item) || `legacy-${index}`;
      map.set(key, { ...(map.get(key) || {}), ...item });
    });
    return [...map.values()];
  }

  function requireRole(allowedRoles, options = {}) {
    const inviteCode = params.get("invite") || "";
    const activeSession = session();
    const user = userForSession(activeSession);
    const authState = loadAuthState();
    const previewAllowed = options.allowPreview && (params.get("preview") === "1" || params.get("admin") === "1");
    const legacyStaffLink = currentPath === "employee-check.html" && params.get("staff") && params.get("token") && storeIdFromUrl();
    const legacyManagerLink = currentPath === "levelove-admin-9c4f2a7.html" && params.get("manager") && params.get("token") && storeIdFromUrl();
    if (previewAllowed) return { ok: true, preview: true, user, session: activeSession };
    if (legacyStaffLink && !activeSession) return { ok: true, legacy: true, user, session: activeSession };
    if (legacyManagerLink) {
      renderUserPill({ name: params.get("name") || "매니저", role: "manager" });
      return {
        ok: true,
        legacy: true,
        user: { id: params.get("manager"), name: params.get("name") || "매니저", role: "manager", storeId: storeIdFromUrl() },
        session: { userId: params.get("manager"), storeId: storeIdFromUrl(), role: "manager", staffId: params.get("manager") },
      };
    }
    if (inviteCode && !activeSession) {
      renderAuthGate({ mode: "invite", inviteCode });
      return { ok: false };
    }
    if (!authState.users.length) {
      hydrateAuthStateFromCloud().then((changed) => {
        if (changed) window.location.reload();
      });
      renderAuthGate({ mode: "setup" });
      return { ok: false };
    }
    if (!activeSession || !user) {
      renderAuthGate({ mode: "login" });
      return { ok: false };
    }
    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
      renderAuthGate({ mode: "denied", user });
      return { ok: false, user, session: activeSession };
    }
    renderUserPill(user);
    return { ok: true, user, session: activeSession };
  }

  function renderUserPill(user) {
    if (!user || document.querySelector(".auth-user-pill")) return;
    const target = document.querySelector(".top-actions") || document.querySelector(".language-switch");
    if (!target) return;
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "auth-user-pill";
    pill.innerHTML = `<span>${escapeHtml(user.name || user.email)}</span><b>${roleLabel(user.role)}</b>`;
    pill.addEventListener("click", signOut);
    target.appendChild(pill);
  }

  function renderAuthGate({ mode, inviteCode = "", user = null }) {
    if (document.querySelector(".auth-gate")) return;
    const gate = document.createElement("div");
    gate.className = "auth-gate";
    gate.innerHTML = authGateMarkup(mode, inviteCode, user);
    document.body.appendChild(gate);
    bindAuthGate(gate, mode, inviteCode);
  }

  function authGateMarkup(mode, inviteCode, user) {
    if (mode === "denied") {
      return `
        <section class="auth-card">
          <p class="eyebrow">Access</p>
          <h1>이 화면에 들어갈 권한이 없어요</h1>
          <p>${escapeHtml(user?.name || "")} 계정은 ${roleLabel(user?.role)} 권한입니다.</p>
          <div class="auth-actions">
            <a class="btn primary" href="employee-check.html">직원 화면으로 가기</a>
            <button class="btn ghost" type="button" data-auth-signout>로그아웃</button>
          </div>
        </section>
      `;
    }
    if (mode === "invite") {
      return `
        <section class="auth-card">
          <p class="eyebrow">Invite</p>
          <h1>직원 초대 수락</h1>
          <p>매장에서 받은 초대 링크로 계정을 만들어요.</p>
          <form data-auth-invite>
            <input name="name" placeholder="이름" autocomplete="name" required />
            <input name="email" type="email" placeholder="이메일" autocomplete="email" required />
            <input name="password" type="password" placeholder="비밀번호" autocomplete="new-password" required />
            <button class="btn primary" type="submit">초대 수락하고 시작</button>
            <small data-auth-message></small>
          </form>
        </section>
      `;
    }
    return `
      <section class="auth-card">
        <p class="eyebrow">Levelove Account</p>
        <h1>${mode === "setup" ? "사장님 계정을 먼저 만들어요" : "로그인이 필요해요"}</h1>
        <p>매장별 데이터와 권한을 분리하기 위해 로그인 후 사용할 수 있습니다.</p>
        <div class="auth-tabs">
          <button class="${mode === "setup" ? "is-active" : ""}" type="button" data-auth-tab="signup">사장님 가입</button>
          <button class="${mode === "setup" ? "" : "is-active"}" type="button" data-auth-tab="login">로그인</button>
        </div>
        <form data-auth-signup ${mode === "setup" ? "" : "hidden"}>
          <input name="storeName" placeholder="매장 이름" required />
          <input name="ownerName" placeholder="사장님 이름" required />
          <input name="email" type="email" placeholder="이메일" autocomplete="email" required />
          <input name="password" type="password" placeholder="비밀번호" autocomplete="new-password" required />
          <button class="btn primary" type="submit">매장 만들고 시작</button>
        </form>
        <form data-auth-login ${mode === "setup" ? "hidden" : ""}>
          <input name="email" type="email" placeholder="이메일" autocomplete="email" required />
          <input name="password" type="password" placeholder="비밀번호" autocomplete="current-password" required />
          <button class="btn primary" type="submit">로그인</button>
        </form>
        <small data-auth-message></small>
      </section>
    `;
  }

  function bindAuthGate(gate, mode, inviteCode) {
    gate.querySelectorAll("[data-auth-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.authTab;
        gate.querySelectorAll("[data-auth-tab]").forEach((item) => item.classList.toggle("is-active", item === button));
        gate.querySelector("[data-auth-signup]").hidden = target !== "signup";
        gate.querySelector("[data-auth-login]").hidden = target !== "login";
      });
    });
    gate.querySelector("[data-auth-signout]")?.addEventListener("click", signOut);
    gate.querySelector("[data-auth-signup]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await hydrateAuthStateFromCloud();
        signUpOwner(Object.fromEntries(form.entries()));
        window.location.reload();
      } catch (error) {
        showGateMessage(gate, error.message);
      }
    });
    gate.querySelector("[data-auth-login]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await hydrateAuthStateFromCloud();
        signIn(form.get("email"), form.get("password"));
        window.location.reload();
      } catch (error) {
        showGateMessage(gate, error.message);
      }
    });
    gate.querySelector("[data-auth-invite]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await hydrateAuthStateFromCloud();
        acceptInvite({
          code: inviteCode,
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        });
        window.location.href = "employee-check.html";
      } catch (error) {
        showGateMessage(gate, error.message);
      }
    });
  }

  function bindSeedTestButton(root) {
    root.querySelector("[data-auth-seed-test]")?.addEventListener("click", async () => {
      try {
        await hydrateAuthStateFromCloud();
        createTestStore();
        window.location.reload();
      } catch (error) {
        showGateMessage(root, error.message);
      }
    });
  }

  function bindGoogleInfoButton(root) {
    root.querySelector("[data-auth-google-info]")?.addEventListener("click", () => {
      showGateMessage(root, "출시 버전에서는 Google 로그인을 먼저 연결할 예정이에요. 지금 테스트는 이메일 가입으로 진행해주세요.");
    });
  }

  function showGateMessage(gate, message) {
    const target = gate.querySelector("[data-auth-message]");
    if (target) target.textContent = message;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderAuthPage() {
    const root = document.querySelector("#authApp");
    if (!root) return;
    hydrateAuthStateFromCloud().then((changed) => {
      if (changed) renderAuthPage();
    });
    const activeSession = session();
    const user = userForSession(activeSession);
    const store = storeForSession(activeSession);
    if (!user) {
      root.innerHTML = `
        <section class="auth-card auth-page-card">
          <p class="eyebrow">Start</p>
          <h1>먼저 개인 계정을 만들어요</h1>
          <p>사장님은 매장을 만들고, 직원은 초대 링크로 합류합니다. 매장 데이터는 계정별로 분리됩니다.</p>
          <div class="account-principle-grid" aria-label="계정 구조">
            <article>
              <span>1</span>
              <strong>개인 계정</strong>
              <p>이메일과 비밀번호로 로그인합니다.</p>
            </article>
            <article>
              <span>2</span>
              <strong>매장 기록</strong>
              <p>성과 포인트와 승인 기록은 매장별로 분리됩니다.</p>
            </article>
            <article>
              <span>3</span>
              <strong>권한 분리</strong>
              <p>사장님, 매니저, 직원 화면이 섞이지 않습니다.</p>
            </article>
          </div>
          <button class="auth-social-btn" type="button" data-auth-google-info>
            <span>G</span>
            Google로 계속하기
            <small>출시 때 연결 예정</small>
          </button>
          <div class="auth-divider"><span>또는 이메일로 시작</span></div>
          <div class="auth-tabs">
            <button class="is-active" type="button" data-auth-tab="signup">사장님 시작</button>
            <button type="button" data-auth-tab="login">로그인</button>
          </div>
          <form data-auth-signup>
            <input name="ownerName" placeholder="내 이름" required />
            <input name="email" type="email" placeholder="이메일" autocomplete="email" required />
            <input name="password" type="password" placeholder="비밀번호" autocomplete="new-password" required />
            <input name="storeName" placeholder="처음 만들 매장 이름" required />
            <button class="btn primary" type="submit">개인 계정 만들고 매장 생성</button>
            <small>직원은 매장에서 받은 초대 링크를 열면 이 계정으로 합류할 수 있어요.</small>
          </form>
          <form data-auth-login hidden>
            <input name="email" type="email" placeholder="이메일" autocomplete="email" required />
            <input name="password" type="password" placeholder="비밀번호" autocomplete="current-password" required />
            <button class="btn primary" type="submit">내 계정으로 계속</button>
          </form>
          <div class="auth-quick-test">
            <strong>실제 테스트를 바로 해보고 싶다면</strong>
            <p>테스트 매장과 기본 직원 초대 링크를 자동으로 만듭니다.</p>
            <button class="btn ghost" type="button" data-auth-seed-test>테스트 매장 바로 만들기</button>
          </div>
          <small data-auth-message></small>
        </section>
      `;
      bindAuthGate(root, "setup", "");
      bindSeedTestButton(root);
      bindGoogleInfoButton(root);
      return;
    }
    const authState = loadAuthState();
    const invites = authState.invites.filter((invite) => invite.storeId === user.storeId).slice().reverse();
    const testInfo = lastTestInfoForStore(user.storeId);
    root.innerHTML = `
      <section class="auth-card auth-page-card">
        <p class="eyebrow">My Levelove</p>
        <h1>${escapeHtml(user.name)}님의 계정</h1>
        <p>현재 ${escapeHtml(store?.name || "우리 매장")}에 연결되어 있습니다.</p>
        <div class="account-status-grid">
          <div><span>매장</span><strong>${escapeHtml(store?.name || "매장")}</strong></div>
          <div><span>현재 권한</span><strong>${roleLabel(user.role)}</strong></div>
          <div><span>이메일</span><strong>${escapeHtml(user.email)}</strong></div>
        </div>
        <div class="auth-actions">
          ${canManage(user.role) ? `<a class="btn primary" href="levelove-admin-9c4f2a7.html">관리자 화면</a>` : ""}
          ${user.role === "owner" ? `<a class="btn ghost" href="levelove-store-9c4f2a7.html">매장 설정</a>` : ""}
          <a class="btn ghost" href="employee-check.html">직원 화면</a>
          <button class="btn ghost" type="button" data-auth-signout>로그아웃</button>
        </div>
      </section>
      ${canManage(user.role) ? `
        <section class="auth-card auth-page-card">
          <p class="eyebrow">Invite</p>
          <h2>직원 초대 링크 만들기</h2>
          <p>직원은 자기 계정으로 가입하고 이 매장에만 연결됩니다.</p>
          <form data-auth-create-invite>
            <input name="staffName" placeholder="직원 이름" required />
            <select name="accessRole">
              <option value="employee">직원</option>
              <option value="manager">매니저</option>
              <option value="admin">관리자</option>
            </select>
            <select name="staffRole">
              <option value="hall">홀</option>
              <option value="kitchen">주방</option>
              <option value="marketer">마케팅</option>
              <option value="manager">매니저</option>
            </select>
            <button class="btn primary" type="submit">초대 링크 생성</button>
            <small data-auth-message></small>
          </form>
          <div class="invite-list">
            ${invites.length ? invites.map((invite) => inviteRow(invite)).join("") : `<p>아직 만든 초대 링크가 없습니다.</p>`}
          </div>
        </section>
        ${testInfo ? testStoreGuide(testInfo) : ""}
      ` : ""}
    `;
    root.querySelector("[data-auth-signout]")?.addEventListener("click", signOut);
    root.querySelector("[data-auth-create-invite]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        const invite = createInvite(Object.fromEntries(form.entries()));
        showGateMessage(root, "초대 링크를 만들었습니다.");
        navigator.clipboard?.writeText(inviteUrl(invite));
        renderAuthPage();
      } catch (error) {
        showGateMessage(root, error.message);
      }
    });
    root.querySelectorAll("[data-copy-invite-url]").forEach((button) => {
      button.addEventListener("click", async () => {
        await navigator.clipboard?.writeText(button.dataset.copyInviteUrl || "");
        const before = button.textContent;
        button.textContent = "복사 완료";
        setTimeout(() => {
          button.textContent = before;
        }, 1100);
      });
    });
  }

  function lastTestInfoForStore(storeId) {
    try {
      const info = JSON.parse(localStorage.getItem(leveloveLastTestKey) || "null");
      return info?.storeId === storeId ? info : null;
    } catch {
      return null;
    }
  }

  function testStoreGuide(info) {
    return `
      <section class="auth-card auth-page-card test-store-guide">
        <p class="eyebrow">Test Store Ready</p>
        <h2>테스트 매장 체크 순서</h2>
        <div class="test-login-box">
          <strong>사장님 로그인</strong>
          <span>${escapeHtml(info.email)} / ${escapeHtml(info.password)}</span>
        </div>
        <ol>
          <li>아래 직원 링크를 새 창에서 엽니다.</li>
          <li>직원 이름, 이메일, 비밀번호를 넣고 초대를 수락합니다.</li>
          <li>출근, 성과, 퇴근 제출을 눌러봅니다.</li>
          <li>관리자 화면에서 승인 흐름을 확인합니다.</li>
        </ol>
        <div class="invite-list">
          ${info.invites.map((invite) => `
            <article class="invite-row">
              <strong>${escapeHtml(invite.staffName)} <span>${escapeHtml(invite.staffRole)}</span></strong>
              <input readonly value="${escapeHtml(invite.url)}" />
              <button class="btn ghost" type="button" data-copy-invite-url="${escapeHtml(invite.url)}">링크 복사</button>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function inviteUrl(invite) {
    const authState = loadAuthState();
    const store = authState.stores.find((item) => item.id === invite.storeId);
    const query = new URLSearchParams({
      store: invite.storeId,
      invite: invite.code,
      storeName: store?.name || "테스트 매장",
      staffName: invite.staffName,
      staffRole: invite.staffRole,
      accessRole: invite.accessRole,
      staffId: invite.staffId,
    });
    return `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}employee-check.html?${query.toString()}`;
  }

  function inviteRow(invite) {
    const used = invite.usedBy ? "사용 완료" : "대기";
    return `
      <article class="invite-row">
        <strong>${escapeHtml(invite.staffName)} <span>${roleLabel(invite.accessRole)}</span></strong>
        <input readonly value="${escapeHtml(inviteUrl(invite))}" />
        <small>${used} · ${escapeHtml(invite.staffRole)}</small>
        <button class="btn ghost" type="button" data-copy-invite-url="${escapeHtml(inviteUrl(invite))}">복사</button>
      </article>
    `;
  }

  window.LeveloveAuth = {
    acceptInvite,
    activeStoreId,
    canManage,
    createInvite,
    currentSession: session,
    currentStore: storeForSession,
    currentUser: userForSession,
    requireRole,
    signIn,
    signOut,
    signUpOwner,
    stateStorageKey,
    storeStateId,
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (currentPath === "auth.html") renderAuthPage();
    if (!publicPages.includes(currentPath)) return;
    if (currentPath === "index.html" && !params.get("stay")) {
      window.location.replace("auth.html");
    }
  });
})();
