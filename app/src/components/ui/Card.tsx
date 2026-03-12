import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-slate-950/70 p-8 shadow-panel backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
};
