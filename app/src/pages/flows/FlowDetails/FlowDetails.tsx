import { Button } from "@app/components/ui/Button";
import { PageMessage } from "@app/components/ui/PageMessage";
import { path as flowsListPath } from "@app/pages/flows/FlowsList";
import { Link, useParams } from "react-router-dom";

const FlowDetails = () => {
  const { flowId } = useParams<{ flowId: string }>();

  return (
    <PageMessage
      action={
        <Link to={flowsListPath}>
          <Button variant="secondary">Back to flows</Button>
        </Link>
      }
      description={`Flow ${flowId ?? "unknown"} is reachable now. FE 06 will replace this placeholder with the builder shell and flow-loading experience.`}
      eyebrow="FE 06 Handoff"
      title="Flow route is ready"
    />
  );
};

export default FlowDetails;
