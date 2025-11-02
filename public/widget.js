(function(){
  // Mini pixel: invia pageview + click al tuo backend
  function send(event, payload){
    try {
      fetch("/api/pixel", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ event, ts: Date.now(), url: location.href, ref: document.referrer, ...payload })
      }).catch(()=>{});
    } catch(e){}
  }

  // Pageview
  send("pageview", {});

  // Traccia click su elementi con data-aiads="track"
  document.addEventListener("click", (e)=>{
    const el = e.target.closest("[data-aiads='track']");
    if (el) {
      const meta = el.getAttribute("data-meta") || "";
      send("click", { meta });
    }
  });

  // Espone un API minimale globale
  window.AIAdsWidget = { track: (name, payload)=>send(name, payload||{}) };
})();
