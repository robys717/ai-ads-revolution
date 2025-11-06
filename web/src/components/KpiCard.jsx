export default function KpiCard({label, value, suffix}) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 shadow-md">
      <div className="kpi">{value}{suffix || ''}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
