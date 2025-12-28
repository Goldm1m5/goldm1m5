// ABMGROUP / GOLDm1m5 – minimal JS (Vanilla)
// - Replace # buttons with real links
// - Hook for later analytics/tracking

(function(){
  const LINKS = {
  exness: "https://www.exmarkets.markets/vi/?utm_source=partners&ex_ol=1",
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


// ===== STEP 6: SIMPLE CLICK & UTM TRACKING =====
(function(){
  function getParam(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
  }
  const utm = {
    source: getParam('utm_source'),
    medium: getParam('utm_medium'),
    campaign: getParam('utm_campaign')
  };
  document.querySelectorAll('a[href]').forEach(a=>{
    a.addEventListener('click', ()=>{
      const payload = {
        href: a.getAttribute('href'),
        utm: utm,
        time: new Date().toISOString()
      };
      console.log('[TRACK]', payload);
      try{
        localStorage.setItem('last_click', JSON.stringify(payload));
      }catch(e){}
    });
  });
})();


// ===== STEP 8: SMART REDIRECT AFTER EXNESS CLICK (NO SERVER) =====
(function(){
  function getParams(){
    const u = new URL(window.location.href);
    const keep = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    const p = new URLSearchParams();
    keep.forEach(k=>{
      const v = u.searchParams.get(k);
      if(v) p.set(k, v);
    });
    return p;
  }

  function isExnessLink(a){
    const href = (a.getAttribute('href') || '').trim();
    if(!href) return false;
    if(href.includes('exmarkets.markets')) return true;
    if(a.hasAttribute('data-exness') || a.hasAttribute('data-exness-cta')) return true;
    return false;
  }

  function attach(){
    const params = getParams();
    document.querySelectorAll('a[href]').forEach(a=>{
      if(!isExnessLink(a)) return;

      // ensure it opens in new tab (safer)
      a.setAttribute('target','_blank');
      a.setAttribute('rel','noopener');

      a.addEventListener('click', function(){
        try{
          const payload = { at: Date.now(), href: a.getAttribute('href'), page: location.pathname, utm: Object.fromEntries(params.entries()) };
          localStorage.setItem('exness_click', JSON.stringify(payload));
        }catch(e){}

        // Redirect current tab to thank-you after a short delay
        const p = getParams();
        p.set('ref','exness');
        p.set('from', (location.pathname.split('/').pop() || 'index.html'));
        const dest = 'thank-you.html?' + p.toString();

        // Use setTimeout so the new tab open isn't blocked
        setTimeout(function(){
          // avoid redirect loop if already on thank-you
          if(!location.pathname.endsWith('thank-you.html')){
            window.location.href = dest;
          }
        }, 250);
      }, {passive:true});
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attach);
  }else{
    attach();
  }
})();
