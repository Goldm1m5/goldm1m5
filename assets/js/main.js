/**
 * GOLDM1M5 – Trackable Funnel v2 (Vanilla JS)
 * Features:
 *  - Auto UTM capture + referrer inference (youtube/facebook/telegram/zalo)
 *  - Append UTM to Exness link
 *  - Local click tracking (Exness / Telegram / Zalo / YouTube / Facebook)
 *  - Lightweight lead capture (name/contact/platform) stored locally
 *
 * Privacy:
 *  - Data is stored only in the visitor's browser (localStorage). No server calls.
 */

(function () {
  const EXNESS_LINK = "https://www.exmarkets.markets/vi/?utm_source=partners&ex_ol=1";
  const LINKS = {
    zaloGroup: "https://zalo.me/g/lpoblz624",
    telegramGroup: "https://t.me/+fbZOGFxVMSQ1ZDZl",
    youtube: "https://www.youtube.com/@goldm1m5",
    facebook: "https://www.facebook.com/goldm1m5",
    zaloSupporter: "https://zalo.me/0793171988"
  };

  const STORE_KEY = "g5_funnel_v2";
  const nowISO = () => new Date().toISOString();

  function getParams() {
    const p = {};
    const qs = window.location.search.replace(/^\?/, "");
    if (!qs) return p;
    qs.split("&").forEach(kv => {
      const [k, v] = kv.split("=");
      if (!k) return;
      p[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
    return p;
  }

  function detectSource() {
    const ref = (document.referrer || "").toLowerCase();
    const host = window.location.hostname.toLowerCase();
    // If no referrer, try to infer from common in-app browsers via UA (best-effort)
    const ua = (navigator.userAgent || "").toLowerCase();

    if (ref.includes("youtube.com") || ref.includes("youtu.be")) return "youtube";
    if (ref.includes("facebook.com") || ref.includes("fb.com")) return "facebook";
    if (ref.includes("t.me") || ref.includes("telegram")) return "telegram";
    if (ref.includes("zalo.me") || ref.includes("zalo")) return "zalo";

    // UA hints (not perfect, but useful when referrer is empty)
    if (ua.includes("fbav") || ua.includes("fban")) return "facebook";
    if (ua.includes("instagram")) return "instagram";
    if (ua.includes("telegram")) return "telegram";

    return "direct";
  }

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveStore(obj) {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  }

  function ensureSession(store) {
    store.session = store.session || {};
    store.session.first_seen = store.session.first_seen || nowISO();
    store.session.last_seen = nowISO();
    store.session.landing = store.session.landing || window.location.href;
    return store;
  }

  function ensureUtm(store) {
    const q = getParams();
    const inferred = detectSource();

    store.utm = store.utm || {};
    store.utm.utm_source = q.utm_source || store.utm.utm_source || inferred;
    store.utm.utm_medium = q.utm_medium || store.utm.utm_medium || "website";
    store.utm.utm_campaign = q.utm_campaign || store.utm.utm_campaign || "goldm1m5_funnel";
    store.utm.utm_content = q.utm_content || store.utm.utm_content || "";
    store.utm.utm_term = q.utm_term || store.utm.utm_term || "";

    return store;
  }

  function withUtm(url, utm) {
    try {
      const u = new URL(url);
      // Keep existing query params, add/override UTM.
      Object.keys(utm || {}).forEach(k => {
        if (utm[k]) u.searchParams.set(k, utm[k]);
      });
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function setHref(sel, href) {
    const el = document.querySelector(sel);
    if (el && href) el.setAttribute("href", href);
  }

  function logClick(store, name) {
    store.clicks = store.clicks || {};
    store.clicks[name] = store.clicks[name] || { count: 0, last: "" };
    store.clicks[name].count += 1;
    store.clicks[name].last = nowISO();
    return store;
  }

  function bindTrackedLink(sel, href, clickName) {
    const el = document.querySelector(sel);
    if (!el) return;
    if (href) el.setAttribute("href", href);
    el.addEventListener("click", () => {
      const s = ensureUtm(ensureSession(loadStore()));
      logClick(s, clickName);
      saveStore(s);
      renderDiag();
    });
  }

  function bindTrackedButton(sel, clickName, onClick) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener("click", () => {
      const s = ensureUtm(ensureSession(loadStore()));
      logClick(s, clickName);
      saveStore(s);
      renderDiag();
      if (typeof onClick === "function") onClick();
    });
  }

  // ----- Init store -----
  let store = ensureUtm(ensureSession(loadStore()));
  saveStore(store);

  // ----- Apply links -----
  const exnessWithUtm = withUtm(EXNESS_LINK, store.utm);

  // Exness CTAs (Hero + Footer + Mobile bar)
  ["1","2","m"].forEach(k => {
    bindTrackedLink(`[data-exness-cta='${k}']`, exnessWithUtm, "exness");
  });

  // Community and channels
  bindTrackedLink("[data-link='telegram']", LINKS.telegramGroup, "telegram_group");
  bindTrackedLink("[data-link='zalo']", LINKS.zaloGroup, "zalo_group");
  bindTrackedLink("[data-link='youtube']", LINKS.youtube, "youtube");
  bindTrackedLink("[data-link='facebook']", LINKS.facebook, "facebook");

  // ----- Lead capture -----
  function saveLead() {
    const name = (document.getElementById("lead_name") || {}).value || "";
    const contact = (document.getElementById("lead_contact") || {}).value || "";
    const platform = (document.getElementById("lead_platform") || {}).value || "MT4";

    // basic validation (soft): require at least contact OR name
    if (!name.trim() && !contact.trim()) {
      setStatus("Vui lòng nhập ít nhất Tên hoặc Kênh liên hệ để lưu thông tin.", true);
      return false;
    }

    const s = ensureUtm(ensureSession(loadStore()));
    s.lead = {
      name: name.trim(),
      contact: contact.trim(),
      platform,
      saved_at: nowISO()
    };
    saveStore(s);
    setStatus("Đã lưu. Bạn có thể vào nhóm để nhận tool/preset theo luồng.", false);
    renderDiag();
    return true;
  }

  function setStatus(msg, isError) {
    const el = document.getElementById("lead_status");
    if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? "#b00020" : "var(--muted)";
  }

  function openGroupAfterLead() {
    // Prefer Telegram first (generally smoother), but user can still use Zalo from buttons
    window.location.href = LINKS.telegramGroup;
  }

  bindTrackedButton("#lead_submit", "lead_submit", () => {
    const ok = saveLead();
    if (ok) openGroupAfterLead();
  });

  // ----- Optional diagnostics -----
  function renderDiag() {
    const out = document.getElementById("diag_out");
    if (!out) return;
    try {
      const s = loadStore();
      out.textContent = JSON.stringify(s, null, 2);
    } catch (e) {}
  }
  renderDiag();

})();
