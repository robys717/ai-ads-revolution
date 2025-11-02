(function(){
  const API_BASE = (window.AI_ADS_API_BASE || "http://localhost:8080/api");
  function sendEvent(type, metadata){
    try {
      navigator.sendBeacon?.(
        API_BASE + "/events",
        new Blob([JSON.stringify({ type, metadata, ts: Date.now() })], { type: "application/json" })
      ) || fetch(API_BASE + "/events", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ type, metadata, ts: Date.now() })
      });
    } catch(e){}
  }
  function mount(container, options){
    const root = document.createElement("div");
    root.style.cssText = "font-family:system-ui,Arial,sans-serif; border:1px solid #e5e7eb; border-radius:12px; padding:16px; box-shadow:0 6px 18px rgba(0,0,0,.05);";
    root.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div>
          <div style="font-weight:700;">${options.title || "Sponsored by AI Ads Revolution"}</div>
          <div style="font-size:12px;color:#6b7280;">${options.subtitle || "Performance-driven ad"}</div>
        </div>
        <button id="aiads-cta" style="padding:10px 14px;border-radius:10px;border:none;cursor:pointer;">
          ${options.ctaText || "Scopri di più"}
        </button>
      </div>`;
    container.appendChild(root);
    sendEvent("view", { placement: options.placement || "default", campaignId: options.campaignId });
    root.querySelector("#aiads-cta").addEventListener("click", () => {
      sendEvent("click", { campaignId: options.campaignId });
      const url = options.url || "#";
      window.open(url, options.target || "_blank");
    });
  }
  function auto(){
    document.querySelectorAll(".aiads-widget").forEach(el=>{
      const opts = {
        title: el.dataset.title,
        subtitle: el.dataset.subtitle,
        ctaText: el.dataset.cta,
        url: el.dataset.url,
        target: el.dataset.target,
        placement: el.dataset.placement,
        campaignId: el.dataset.campaign
      };
      mount(el, opts);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto);
  else auto();
  window.AIAds = { mount, sendEvent };
})();
