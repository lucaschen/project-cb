import type { PropsWithChildren } from "react";

export const SectionLabel = ({ children }: PropsWithChildren) => {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
      {children}
    </p>
  );
};
