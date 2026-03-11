import { Link } from "react-router-dom";

import { Button } from "@app/components/ui/Button";
import { PageMessage } from "@app/components/ui/PageMessage";

export const NotFoundPage = () => {
  return (
    <PageMessage
      action={
        <Link to="/login">
          <Button variant="secondary">Return to login</Button>
        </Link>
      }
      description="The page you asked for does not exist in the current MVP frontend."
      eyebrow="404"
      title="Page not found"
    />
  );
};
