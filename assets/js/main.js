// ABMGROUP / GOLDm1m5 – minimal JS (Vanilla)
// - Replace # buttons with real links
// - Hook for later analytics/tracking

(function(){
  const LINKS = {
  exness: EXNESS_LINK,
  telegram: "https://t.me/+fbZOGFxVMSQ1ZDZl",
  zalo_group: "https://zalo.me/g/lpoblz624",
  zalo_contact: "https://zalo.me/0793171988",
  hotline: "https://zalo.me/0793171988",
  youtube: "https://www.youtube.com/@goldm1m5",
  facebook: "https://www.facebook.com/goldm1m5",
  abmgroup: "https://abmgroup.asia/"
};

  // Attach data-link
  document.querySelectorAll("[data-link]").forEach(a=>{
    const k = a.getAttribute("data-link");
    if(!k) return;
    const href = LINKS[k];
    if(href) a.setAttribute("href", href);
  });

  // Attach Exness CTA
  document.querySelectorAll("[data-exness]").forEach(a=>{
    a.setAttribute("href", LINKS.exness);
  });

  // Safety: open external in new tab
  document.querySelectorAll("a[href^='http']").forEach(a=>{
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });
})();
