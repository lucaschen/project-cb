import { ApiError } from "@app/api/client";
import { queryKeys } from "@app/api/queryKeys";
import { createSession } from "@app/api/session";
import { AuthShell } from "@app/components/AuthShell";
import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const validate = (email: string, password: string) => {
  return {
    email: email.trim() ? "" : "Email is required.",
    password: password.trim() ? "" : "Password is required.",
  };
};

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  const { mutateAsync: login, isPending: isLoginPending } = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.session, session);
      navigate("/flows", { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        setFormError(
          "Login unsuccessful. Check your email and password and try again.",
        );
        return;
      }

      setFormError("Unable to sign in right now. Try again.");
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(email, password);
    setFieldErrors(nextErrors);
    setFormError("");

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    await login({
      email: email.trim(),
      password,
    });
  };

  return (
    <AuthShell
      cta={
        <div className="space-y-3">
          <p className="font-medium text-white">Current scope</p>
          <p>
            FE 02 wires the real auth flow onto the foundation branch, including
            public routes, session bootstrap, protected flows access, and
            logout.
          </p>
        </div>
      }
      description="Use your internal account to establish a real session before entering the protected shell."
      eyebrow="Internal Access"
      footerLabel="Need an account?"
      footerText="Create one"
      footerTo="/signup"
      title="Sign in to continue building Project CB flows."
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
        <p className="text-sm leading-6 text-slate-300">
          Email/password auth is live. Organization onboarding lands in the next
          branch.
        </p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <FormField
          autoComplete="email"
          error={fieldErrors.email}
          id="login-email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          type="email"
          value={email}
        />
        <FormField
          autoComplete="current-password"
          error={fieldErrors.password}
          id="login-password"
          label="Password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          type="password"
          value={password}
        />
        {formError ? (
          <p className="text-sm text-rose-300">{formError}</p>
        ) : null}
        <Button className="w-full" isBusy={isLoginPending} type="submit">
          Sign in
        </Button>
      </form>
      <div className="mt-6 text-sm text-slate-400">
        <Link
          className="text-sky-200 transition hover:text-sky-100"
          to="/signup"
        >
          New internal user? Create an account here.
        </Link>
      </div>
    </AuthShell>
  );
};

export default Login;
