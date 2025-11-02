import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fetchJSON = async (url) => (await fetch(url)).json();

export default function Dashboard(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(){
    setLoading(true);
    const res = await fetchJSON("/interactions");
    setItems(res.items || []);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  const avg = (k)=> items.length ? (items.reduce((s,x)=> s + Number(x[k]||0), 0)/items.length) : 0;
  const spendTot = items.reduce((s,x)=> s + Number(x.spend||0), 0);

  async function add(e){
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    await fetch("/interactions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    e.currentTarget.reset();
    load();
  }

  return (
    <div className="min-h-screen px-6 md:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
        <a href="/" className="underline text-neutral-400">Home</a>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card"><div className="text-neutral-400">CTR medio</div><div className="text-3xl">{avg("ctr").toFixed(2)}%</div></div>
        <div className="card"><div className="text-neutral-400">CPC medio</div><div className="text-3xl">€ {avg("cpc").toFixed(2)}</div></div>
        <div className="card"><div className="text-neutral-400">Spesa totale</div><div className="text-3xl">€ {spendTot.toFixed(2)}</div></div>
      </div>

      <div className="card mt-6">
        <div className="text-neutral-300 mb-4">Andamento spesa</div>
        <div style={{height: 280}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="spend" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-6">
        <div className="text-neutral-300 mb-3">Aggiungi interaction</div>
        <form className="grid md:grid-cols-5 gap-3" onSubmit={add}>
          <input name="channel" placeholder="Canale" className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700"/>
          <input name="ctr" type="number" step="0.01" placeholder="CTR" className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700"/>
          <input name="cpc" type="number" step="0.01" placeholder="CPC" className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700"/>
          <input name="spend" type="number" step="0.01" placeholder="Spesa" className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700"/>
          <button className="px-4 py-2 rounded-lg bg-sky-500 text-black font-semibold">Aggiungi</button>
        </form>

        <div className="overflow-x-auto mt-5">
          <table className="min-w-full text-sm">
            <thead className="text-neutral-400"><tr>
              <th className="text-left pr-6 py-2">ID</th>
              <th className="text-left pr-6">Data</th>
              <th className="text-left pr-6">Canale</th>
              <th className="text-left pr-6">CTR</th>
              <th className="text-left pr-6">CPC</th>
              <th className="text-left pr-6">Spesa</th>
            </tr></thead>
            <tbody>
              {items.map(x=>(
                <tr key={x.id} className="border-t border-neutral-800">
                  <td className="py-2 pr-6">{x.id}</td>
                  <td className="pr-6">{new Date(x.date).toLocaleString()}</td>
                  <td className="pr-6">{x.channel}</td>
                  <td className="pr-6">{x.ctr}%</td>
                  <td className="pr-6">€ {x.cpc}</td>
                  <td className="pr-6">€ {x.spend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <div className="text-neutral-500 mt-4">Caricamento…</div>}
    </div>
  );
}
