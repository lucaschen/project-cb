import { getCurrentUserOrganizations } from "@app/api/organizations";
import { queryKeys } from "@app/api/queryKeys";
import { createSession } from "@app/api/session";
import { AuthShell } from "@app/components/AuthShell";
import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import { path as homePath } from "@app/pages/Home";
import { useToast } from "@app/components/ui/ToastProvider";
import { getApiErrorMessage } from "@app/utils/getApiErrorMessage";
import { clearStoredActiveOrganizationId } from "@app/utils/localStorage";
import { syncActiveOrganizationId } from "@app/utils/organizations";
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
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const { mutateAsync: login, isPending: isLoginPending } = useMutation({
    mutationFn: createSession,
    onSuccess: async (session) => {
      queryClient.setQueryData(queryKeys.session, session);
      const organizations = await queryClient.fetchQuery({
        queryFn: getCurrentUserOrganizations,
        queryKey: queryKeys.currentUserOrganizations,
      });

      const activeOrganizationId = syncActiveOrganizationId(organizations);

      if (!activeOrganizationId) {
        clearStoredActiveOrganizationId();
      }

      // TODO: handle url saved redirects
      navigate(homePath, { replace: true });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, {
          byStatus: {
            401: "Login unsuccessful. Check your email and password and try again.",
          },
          default: "Unable to sign in right now. Try again.",
        }),
      );
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(email, password);
    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch {
      return;
    }
  };

  return (
    <AuthShell
      cta={
        <div className="space-y-3">
          <p className="font-medium text-white">Current scope</p>
          <p>
            Auth and onboarding are both live now. Sign in, resolve org context,
            and continue directly into the protected shell with an active
            organization.
          </p>
        </div>
      }
      description="Use your internal account to establish a real session before entering the organization-aware workspace."
      eyebrow="Internal Access"
      footerLabel="Need an account?"
      footerText="Create one"
      footerTo="/signup"
      title="Sign in to continue building Project CB flows."
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
        <p className="text-sm leading-6 text-slate-300">
          Sign in will restore your active organization when possible, or
          continue into onboarding if you do not belong to one yet.
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
