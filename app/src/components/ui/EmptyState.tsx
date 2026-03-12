import { Card } from "@app/components/ui/Card";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export const EmptyState = ({ action, description, title }: EmptyStateProps) => {
  return (
    <Card className="max-w-xl border-dashed border-slate-700/80 bg-slate-900/50 text-center">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="text-sm leading-6 text-slate-300">{description}</p>
      </div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
};
