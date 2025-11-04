export default function KpiCard({label, value, suffix}) {
  return (
    <div className="card">
      <div className="kpi">{value}{suffix || ''}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
