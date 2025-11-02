import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean, className?: string };
export function Button({ asChild, className="", children, ...rest }: Props) {
  const cls = "px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white " + className;
  if (asChild) return <span className={cls} {...(rest as any)}>{children}</span>;
  return <button className={cls} {...rest}>{children}</button>;
}
export default Button;
