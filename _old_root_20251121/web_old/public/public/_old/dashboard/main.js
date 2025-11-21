const API = window.location.origin;

function euroFromCents(c){ return (Number(c||0)/100).toFixed(2); }
function getToken(){ return localStorage.getItem('token') || ''; }
function setToken(t){ localStorage.setItem('token', t); }

function setAuthState(){
  const t = getToken();
  const el = document.getElementById('authState');
  const out = document.getElementById('logoutBtn');
  if(t){ el.textContent = 'Autenticato'; out.style.display='inline-block'; }
  else { el.textContent = 'Non autenticato'; out.style.display='none'; }
}

async function api(path, opts={}){
  const t = getToken();
  const headers = Object.assign({'Content-Type':'application/json'}, (t?{'Authorization':'Bearer '+t}:{}) );
  const res = await fetch(API+path, { ...opts, headers });
  const data = await res.json().catch(()=> ({}));
  if(!res.ok) throw new Error(data?.error || 'Errore');
  return data;
}

// REGISTRAZIONE
document.getElementById('regBtn').onclick = async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  const msg = document.getElementById('regMsg');
  msg.textContent = '...';
  try{
    const r = await api('/auth/register', { method:'POST', body: JSON.stringify({ name, email, password })});
    setToken(r.token); setAuthState();
    msg.textContent = 'Registrazione ok. Token salvato.';
    loadCampaigns();
  }catch(e){ msg.textContent = 'Errore: '+e.message; }
};

// LOGIN
document.getElementById('logBtn').onclick = async () => {
  const email = document.getElementById('logEmail').value.trim();
  const password = document.getElementById('logPass').value;
  const msg = document.getElementById('logMsg');
  msg.textContent = '...';
  try{
    const r = await api('/auth/login', { method:'POST', body: JSON.stringify({ email, password })});
    setToken(r.token); setAuthState();
    msg.textContent = 'Login ok. Token salvato.';
    loadCampaigns();
  }catch(e){ msg.textContent = 'Errore: '+e.message; }
};

// LOGOUT
document.getElementById('logoutBtn').onclick = () => {
  localStorage.removeItem('token'); setAuthState();
  document.getElementById('cTable').innerHTML = '';
};

// CREA CAMPAGNA
document.getElementById('cCreateBtn').onclick = async () => {
  const title = document.getElementById('cTitle').value.trim();
  const description = document.getElementById('cDesc').value.trim();
  const destination_url = document.getElementById('cDest').value.trim();
  const budget_eur = Number(document.getElementById('cBudget').value || 0);
  const cpc_eur = Number(document.getElementById('cCpc').value || 0.2);
  const cpv_eur = Number(document.getElementById('cCpv').value || 0.001);
  const location = document.getElementById('cLoc').value.trim();
  const interests = document.getElementById('cInt').value.trim();
  const msg = document.getElementById('cMsg');
  msg.textContent = '...';
  try{
    await api('/campaigns', { method:'POST', body: JSON.stringify({ title, description, destination_url, budget_eur, cpc_eur, cpv_eur, location, interests })});
    msg.textContent = 'Campagna creata ✅';
    document.getElementById('cTitle').value='';
    loadCampaigns();
  }catch(e){ msg.textContent = 'Errore: '+e.message; }
};

// LISTA CAMPAGNE
async function loadCampaigns(){
  const tBody = document.getElementById('cTable');
  tBody.innerHTML = '';
  const rows = await api('/campaigns');
  rows.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.title}</td>
      <td>${euroFromCents(c.budget_cents)}</td>
      <td>${c.active ? '✅' : '⛔'}</td>
      <td><a href="/click?campaign_id=${c.id}" target="_blank">Test Click</a></td>
    `;
    tBody.appendChild(tr);
  });
}

setAuthState();
try{ if(getToken()) loadCampaigns(); }catch(e){}
