import type { tooltipElementPropertiesType } from "@packages/shared/generated/elements/index";

type TooltipElementProps = {
  properties: tooltipElementPropertiesType;
};

const TooltipElement = ({ properties }: TooltipElementProps) => (
  <div className="inline-flex max-w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <span className="rounded-full border border-sky-300/25 bg-sky-300/12 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
      {properties.triggerText}
    </span>
    <span className="text-sm leading-5 text-slate-300">{properties.hoverText}</span>
  </div>
);

export default TooltipElement;
