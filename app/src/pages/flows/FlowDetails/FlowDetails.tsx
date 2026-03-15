import "@xyflow/react/dist/style.css";

import { getFlow } from "@app/api/flows";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import { PageMessage } from "@app/components/ui/PageMessage";
import useDebouncedMemo from "@app/hooks/useDebouncedMemo";
import useRootContext from "@app/hooks/useRootContext";
import { path as flowsListPath } from "@app/pages/flows/FlowsList";
import { getApiErrorMessage } from "@app/utils/getApiErrorMessage";
import FlowBuilderEntity from "@packages/shared/entities/FlowBuilderEntity/FlowBuilderEntity";
import type { FlowWithNodesType } from "@packages/shared/http/schemas/flows/common";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, PanelsLeftBottom, PanelsTopLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import BuilderPalette from "./components/BuilderPalette";
import BuilderSidebar from "./components/BuilderSidebar";
import FlowCanvas from "./components/FlowCanvas";
import useBuilderLeaveConfirmation from "./hooks/useBuilderLeaveConfirmation";
import useBuilderStore from "./store/builderStore";
import { flowToReactFlow } from "./utils/builderFlowToReactFlow";

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
          default:
            "Project CB could not load this flow right now. Retry the request or return to the flows workspace.",
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
  const baseBuilderPayload = useMemo(
    () => FlowBuilderEntity.fromFlow(flow).getPayload(),
    [flow],
  );

  const initializeGraph = useBuilderStore((state) => state.initializeGraph);
  const edges = useBuilderStore((state) => state.edges);
  const nodes = useBuilderStore((state) => state.nodes);

  const currentGraph = useMemo(() => ({ edges, nodes }), [edges, nodes]);

  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  const isDirty = useDebouncedMemo(
    () =>
      JSON.stringify(FlowBuilderEntity.fromGraph(currentGraph).getPayload()) !==
      JSON.stringify(baseBuilderPayload),
    [baseBuilderPayload, currentGraph],
    200,
  );

  const validationErrors = useDebouncedMemo(
    () => FlowBuilderEntity.fromGraph(currentGraph).getValidationErrors(),
    [currentGraph],
    200,
  );

  useEffect(() => {
    if (!baseReactFlowGraph) return;

    initializeGraph(baseReactFlowGraph);
  }, [baseReactFlowGraph, initializeGraph]);

  useBuilderLeaveConfirmation(isDirty);

  if (!activeOrganization) return null;

  return (
    <main className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950">
      <div className="relative flex min-h-0 flex-1 items-stretch overflow-hidden">
        {isPaletteOpen ? (
          <div className="relative flex h-full min-h-0 w-[216px] shrink-0">
            <BuilderPalette isOpen={isPaletteOpen} />
            <button
              aria-label="Collapse palette"
              className="absolute right-0 top-1/4 z-30 flex h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/72 text-slate-300 shadow-[0_12px_32px_rgba(2,6,23,0.32)] backdrop-blur transition hover:border-sky-300/35 hover:bg-slate-900/88 hover:text-sky-100"
              onClick={() => setIsPaletteOpen(false)}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            aria-label="Expand palette"
            className="absolute left-3 top-1/4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/72 text-slate-300 shadow-[0_12px_32px_rgba(2,6,23,0.32)] backdrop-blur transition hover:border-sky-300/35 hover:bg-slate-900/88 hover:text-sky-100"
            onClick={() => setIsPaletteOpen(true)}
            type="button"
          >
            <PanelsLeftBottom className="h-4 w-4" />
          </button>
        )}
        <div className="flex h-full min-h-0 min-w-0 flex-1">
          <FlowCanvas />
        </div>
        {isInspectorOpen ? (
          <div className="relative flex h-full min-h-0 w-[392px] shrink-0 xl:w-[404px]">
            <BuilderSidebar
              activeOrganizationId={activeOrganization.id}
              flow={flow}
              isDirty={isDirty}
              isOpen={isInspectorOpen}
              validationErrors={validationErrors}
            />
            <button
              aria-label="Collapse inspector"
              className="absolute left-0 top-1/4 z-30 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/72 text-slate-300 shadow-[0_12px_32px_rgba(2,6,23,0.32)] backdrop-blur transition hover:border-fuchsia-300/35 hover:bg-slate-900/88 hover:text-fuchsia-100"
              onClick={() => setIsInspectorOpen(false)}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            aria-label="Expand inspector"
            className="absolute right-3 top-1/4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/72 text-slate-300 shadow-[0_12px_32px_rgba(2,6,23,0.32)] backdrop-blur transition hover:border-fuchsia-300/35 hover:bg-slate-900/88 hover:text-fuchsia-100"
            onClick={() => setIsInspectorOpen(true)}
            type="button"
          >
            <PanelsTopLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    </main>
  );
};

export default Wrapper;
