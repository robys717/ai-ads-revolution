import React from "react";
export function Card({ className="", children }: { className?: string, children: React.ReactNode }) {
  return <div className={"rounded-2xl border border-white/10 bg-white/5 " + className}>{children}</div>;
}
export function CardContent({ className="", children }: { className?: string, children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
export default Card;
