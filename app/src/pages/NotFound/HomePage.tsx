import { Link } from "react-router-dom";

import { Button } from "@app/components/ui/Button";
import { Card } from "@app/components/ui/Card";

const routeCards = [
  {
    description: "Foundation auth entry point",
    title: "Login",
    to: "/login",
  },
  {
    description: "Internal account registration path",
    title: "Signup",
    to: "/signup",
  },
  {
    description: "Organization setup scaffold",
    title: "Org onboarding",
    to: "/onboarding/organization",
  },
  {
    description: "Protected flows placeholder",
    title: "Flows",
    to: "/flows",
  },
];

export const HomePage = () => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col justify-center px-6 py-12">
      <section className="rounded-[32px] border border-white/10 bg-slate-950/60 p-8 shadow-panel backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
          Foundation Home
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Project CB frontend scaffold
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This branch is the foundation layer. Use the navigator above or the quick links below
          to move through the deliverable routes and verify the initial structure.
        </p>
        <div className="mt-8">
          <Link to="/login">
            <Button>Start at login</Button>
          </Link>
        </div>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {routeCards.map((routeCard) => (
          <Card key={routeCard.to} className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Route
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">{routeCard.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{routeCard.description}</p>
            <div className="mt-6">
              <Link to={routeCard.to}>
                <Button className="w-full" variant="secondary">
                  Open
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
};
