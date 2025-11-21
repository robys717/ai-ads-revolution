import React from "react";

export function KpiCard({ label, value, suffix="" }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}{suffix}</div>
    </div>
  );
}
export default KpiCard;
