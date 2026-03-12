import { Button } from "@app/components/ui/Button";
import { Card } from "@app/components/ui/Card";
import { SectionLabel } from "@app/components/ui/SectionLabel";

export const OrganizationOnboardingPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/55 p-8 shadow-panel backdrop-blur">
          <SectionLabel>Organization Setup</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Create the first organization before entering the workspace.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            The route is in place now so FE 03 can add the real onboarding flow without
            changing the app structure again.
          </p>
          <div className="mt-8 rounded-[24px] border border-sky-300/20 bg-sky-300/10 p-5 text-sm leading-6 text-slate-100">
            Organization creation, slug generation, and active-org persistence land in the
            next branch.
          </div>
        </section>
        <Card>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Onboarding route placeholder</h2>
            <p className="text-sm leading-6 text-slate-300">
              FE 03 will replace this with the real organization creation form.
            </p>
          </div>
          <div className="mt-8 space-y-4 rounded-[24px] border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm leading-6 text-slate-300">
            <p>Planned next in FE 03:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-sky-300">
              <li>Create organization with name and slug</li>
              <li>Auto-generate the slug with manual override</li>
              <li>Persist active org selection and continue to flows</li>
            </ul>
          </div>
          <div className="mt-8">
            <Button className="w-full" disabled>
              Organization creation coming next
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
};
