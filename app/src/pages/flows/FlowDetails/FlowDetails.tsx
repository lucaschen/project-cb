import "@xyflow/react/dist/style.css";

import { getFlow } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import { PageMessage } from "@app/components/ui/PageMessage";
import useDebouncedMemo from "@app/hooks/useDebouncedMemo";
import { path as flowsListPath } from "@app/pages/flows/FlowsList";
import { getApiErrorMessage } from "@app/utils/getApiErrorMessage";
import useRootContext from "@app/hooks/useRootContext";
import type { FlowWithNodesType } from "@packages/shared/http/schemas/flows/common";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import BuilderPalette from "./components/BuilderPalette";
import BuilderSidebar from "./components/BuilderSidebar";
import FlowCanvas from "./components/FlowCanvas";
import useBuilderLeaveConfirmation from "./hooks/useBuilderLeaveConfirmation";
import useBuilderStore from "./store/builderStore";
import { flowToReactFlow } from "./utils/builderFlowToReactFlow";
import { getBuilderValidationErrors, isGraphDirty } from "./utils/builderGraph";

const Wrapper = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const flowQuery = useQuery({
    enabled: !!flowId,
    queryFn: () =>
      getFlow({
        flowId: flowId!,
      }),
    queryKey: flowId ? queryKeys.flow(flowId) : ["flows", "unknown"],
    staleTime: Infinity,
  });

  if (!flowId) {
    return null;
  }

  if (flowQuery.isPending) {
    return (
      <PageMessage
        description="Loading the latest flow metadata and builder graph for this workspace."
        eyebrow="Loading"
        title="Preparing flow builder"
      />
    );
  }

  if (flowQuery.isError) {
    return (
      <PageMessage
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              isBusy={flowQuery.isFetching}
              onClick={() => void flowQuery.refetch()}
              variant="secondary"
            >
              Retry
            </Button>
            <Link to={flowsListPath}>
              <Button>Back to flows</Button>
            </Link>
          </div>
        }
        description={getApiErrorMessage(flowQuery.error, {
          byStatus: {
            404: "Project CB could not find this flow. It may have been removed or you may no longer have access to it.",
          },
          default: "Project CB could not load this flow right now. Retry the request or return to the flows workspace.",
        })}
        eyebrow="Flow Unavailable"
        title="Unable to load flow"
      />
    );
  }

  return <FlowDetails flow={flowQuery.data.flow} />;
};

type Props = {
  flow: FlowWithNodesType;
};

const FlowDetails = ({ flow }: Props) => {
  const { activeOrganization } = useRootContext();
  const baseReactFlowGraph = useMemo(() => flowToReactFlow(flow), [flow]);

  const initializeGraph = useBuilderStore((state) => state.initializeGraph);
  const edges = useBuilderStore((state) => state.edges);
  const nodes = useBuilderStore((state) => state.nodes);

  const currentGraph = useMemo(() => ({ edges, nodes }), [edges, nodes]);

  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  const isDirty = useDebouncedMemo(
    () => isGraphDirty(currentGraph, baseReactFlowGraph),
    [currentGraph, baseReactFlowGraph],
    500,
  );

  const validationErrors = useDebouncedMemo(
    () => getBuilderValidationErrors(baseReactFlowGraph ? currentGraph : null),
    [baseReactFlowGraph, currentGraph],
    500,
  );

  useEffect(() => {
    if (!baseReactFlowGraph) return;

    initializeGraph(baseReactFlowGraph);
  }, [baseReactFlowGraph, initializeGraph]);

  useBuilderLeaveConfirmation(isDirty);

  if (!activeOrganization) return null;

  return (
    <main className="flex h-full min-h-0 w-full flex-col overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
      <div className="relative flex min-h-0 flex-1 items-stretch gap-2 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex items-start justify-between">
          <button
            className={`pointer-events-auto rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_12px_30px_rgba(2,6,23,0.32)] backdrop-blur ${
              isPaletteOpen
                ? "border-sky-300/30 bg-sky-300/10 text-sky-100"
                : "border-white/10 bg-slate-950/85 text-slate-300"
            }`}
            onClick={() => setIsPaletteOpen((currentValue) => !currentValue)}
            type="button"
          >
            {isPaletteOpen ? "Hide palette" : "Show palette"}
          </button>
          <button
            className={`pointer-events-auto rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_12px_30px_rgba(2,6,23,0.32)] backdrop-blur ${
              isInspectorOpen
                ? "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100"
                : "border-white/10 bg-slate-950/85 text-slate-300"
            }`}
            onClick={() => setIsInspectorOpen((currentValue) => !currentValue)}
            type="button"
          >
            {isInspectorOpen ? "Hide inspector" : "Show inspector"}
          </button>
        </div>
        {isPaletteOpen ? (
          <div className="flex h-full min-h-0 w-[216px] shrink-0 pt-16">
            <BuilderPalette isOpen={isPaletteOpen} />
          </div>
        ) : null}
        <div className="flex h-full min-h-0 min-w-0 flex-1">
          <FlowCanvas
            flowName={flow.name}
            flowSlug={flow.slug}
            isDirty={isDirty}
          />
        </div>
        {isInspectorOpen ? (
          <div className="flex h-full min-h-0 w-[404px] shrink-0 pt-16">
            <BuilderSidebar
              activeOrganizationId={activeOrganization.id}
              flow={flow}
              isDirty={isDirty}
              isOpen={isInspectorOpen}
              validationErrors={validationErrors}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Wrapper;
