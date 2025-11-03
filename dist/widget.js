(function(){
  function send(event, payload){
    try{
      fetch("/api/pixel", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ event, ts: Date.now(), url: location.href, ref: document.referrer, ...(payload||{}) })
      }).catch(()=>{});
    }catch(e){}
  }
  send("pageview", {});
  document.addEventListener("click", (e)=>{
    const el = e.target.closest("[data-aiads='track']");
    if(el){ send("click", { meta: el.getAttribute("data-meta")||"" }); }
  });
  window.AIAdsWidget = { conversion: (payload)=>send("conversion", payload||{}) };
})();
