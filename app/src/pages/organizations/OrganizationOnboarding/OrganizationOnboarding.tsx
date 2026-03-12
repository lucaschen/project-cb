import { createOrganization } from "@app/api/organizations";
import { queryKeys } from "@app/api/queryKeys";
import { Button } from "@app/components/ui/Button";
import { Card } from "@app/components/ui/Card";
import { FormField } from "@app/components/ui/FormField";
import { SectionLabel } from "@app/components/ui/SectionLabel";
import { path as flowsListPath } from "@app/pages/flows/FlowsList";
import { syncActiveOrganizationId } from "@app/utils/organizations";
import { toSlug } from "@app/utils/slug";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const validate = (name: string, slug: string) => {
  return {
    name: name.trim() ? "" : "Organization name is required.",
    slug: slug.trim() ? "" : "Organization slug is required.",
  };
};

const OrganizationOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    slug: "",
  });
  const [formError, setFormError] = useState("");

  const createOrganizationMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: async (organization) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.currentUserOrganizations,
      });
      syncActiveOrganizationId([organization]);
      navigate(flowsListPath, { replace: true });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 400) {
        setFormError(
          "Unable to create the organization with those details. Try another name or slug.",
        );
        return;
      }

      setFormError("Unable to create the organization right now. Try again.");
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(name, slug);
    setFieldErrors(nextErrors);
    setFormError("");

    if (nextErrors.name || nextErrors.slug) {
      return;
    }

    await createOrganizationMutation.mutateAsync({
      name: name.trim(),
      slug: slug.trim(),
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/55 p-8 shadow-panel backdrop-blur">
          <SectionLabel>Organization Setup</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Create the first organization before entering the workspace.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            The MVP is internal-only, but organization context still matters
            because flows belong to an organization from the start. Keep the
            setup lightweight and correct.
          </p>
          <div className="mt-8 rounded-[24px] border border-sky-300/20 bg-sky-300/10 p-5 text-sm leading-6 text-slate-100">
            Your organization becomes the active working context immediately
            after creation.
          </div>
        </section>
        <Card>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">
              Create organization
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              This is the first step after account creation for users who do not
              yet belong to an organization.
            </p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <FormField
              error={fieldErrors.name}
              id="organization-name"
              label="Organization name"
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);

                if (!slugTouched) {
                  setSlug(toSlug(nextName));
                }
              }}
              placeholder="Acme Research"
              value={name}
            />
            <FormField
              error={fieldErrors.slug}
              helperText="This can be edited before submission. We auto-generate it from the name until you change it."
              id="organization-slug"
              label="Organization slug"
              onBlur={() => setSlugTouched(true)}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="acme-research"
              value={slug}
            />
            {formError ? (
              <p className="text-sm text-rose-300">{formError}</p>
            ) : null}
            <Button
              className="w-full"
              isBusy={createOrganizationMutation.isPending}
              type="submit"
            >
              Create organization
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
};

export default OrganizationOnboarding;
