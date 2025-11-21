(function(){
  const s=document.currentScript, pub=s.getAttribute('data-pub')||'', location=s.getAttribute('data-location')||'', interests=s.getAttribute('data-interests')||'';
  const base=s.src.replace(/\/ad-widget\.js.*/, '/');
  function el(t,a={},ch=[]){const e=document.createElement(t);Object.entries(a).forEach(([k,v])=>{if(k==='style'){Object.assign(e.style,v);}else e.setAttribute(k,v);});ch.forEach(c=>e.appendChild(c));return e;}
  fetch(`${base}ads.json?pub=${encodeURIComponent(pub)}&location=${encodeURIComponent(location)}&interests=${encodeURIComponent(interests)}`)
  .then(r=>r.json()).then(ad=>{ if(!ad||!ad.id) return; const box=el('div',{style:{border:'1px solid #ddd',borderRadius:'12px',padding:'12px',fontFamily:'system-ui,Arial',maxWidth:'360px',boxShadow:'0 4px 16px rgba(0,0,0,0.06)'}});
    const title=el('div',{style:{fontWeight:'700',marginBottom:'6px',fontSize:'16px'}},[document.createTextNode(ad.title||'Sponsored')]);
    const desc=el('div',{style:{color:'#444',fontSize:'13px',marginBottom:'8px'}},[document.createTextNode(ad.description||'')]);
    const img=ad.asset_url?el('img',{src:ad.asset_url,style:{width:'100%',borderRadius:'10px',marginBottom:'8px'}}):null;
    const btn=el('a',{href:ad.click_url,style:{display:'inline-block',padding:'8px 12px',background:'#0b5ed7',color:'#fff',borderRadius:'10px',textDecoration:'none'}},[document.createTextNode('Scopri')]);
    box.appendChild(title); box.appendChild(desc); if(img) box.appendChild(img); box.appendChild(btn); s.parentNode.insertBefore(box,s);
  }).catch(()=>{});
})();
