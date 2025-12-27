const CONFIG = {
  exnessLink: "https://one.exnessonelink.com/a/vjdp1em5",
  zaloGroup: "https://zalo.me/g/lpoblz624",
  telegramGroup: "https://t.me/+fbZOGFxVMSQ1ZDZl",
  docsHub: "https://abmgroup.asia/docs/",
  goldLanding: "https://goldm1m5.com"
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-cta='exness']").forEach(a => a.setAttribute("href", CONFIG.exnessLink));
  document.querySelectorAll("[data-cta='zalo']").forEach(a => a.setAttribute("href", CONFIG.zaloGroup));
  document.querySelectorAll("[data-cta='tele']").forEach(a => a.setAttribute("href", CONFIG.telegramGroup));
  document.querySelectorAll("[data-cta='docs']").forEach(a => a.setAttribute("href", CONFIG.docsHub));
  document.querySelectorAll("[data-cta='gold']").forEach(a => a.setAttribute("href", CONFIG.goldLanding));

  document.querySelectorAll("a[data-cta]").forEach(a => {
    a.setAttribute("target","_blank");
    a.setAttribute("rel","noopener");
  });

  const btn = document.getElementById("menuBtn");
  const nav = document.getElementById("topNav");
  if(btn && nav){
    btn.addEventListener("click", () => nav.classList.toggle("open"));
  }
});
