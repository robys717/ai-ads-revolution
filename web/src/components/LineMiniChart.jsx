import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function LineMiniChart({data, dataKey="spend"}) {
  return (
    <div className="card" style={{height:220}}>
      <div className="mb-2 text-sm text-slate-400">Trend</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} dot={false} strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
