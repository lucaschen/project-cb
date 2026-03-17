import { getCurrentUserOrganizations } from "@app/api/organizations";
import { queryKeys } from "@app/api/queryKeys";
import { createSession, createUser } from "@app/api/session";
import { AuthShell } from "@app/components/AuthShell";
import { Button } from "@app/components/ui/Button";
import { FormField } from "@app/components/ui/FormField";
import useToast from "@app/components/ui/useToast";
import { path as homePath } from "@app/pages/Home";
import { getApiErrorMessage } from "@app/utils/getApiErrorMessage";
import { clearStoredActiveOrganizationId } from "@app/utils/localStorage";
import { syncActiveOrganizationId } from "@app/utils/organizations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const validate = (email: string, password: string, confirmPassword: string) => {
  return {
    confirmPassword: confirmPassword.trim()
      ? ""
      : "Please confirm your password.",
    email: email.trim() ? "" : "Email is required.",
    password: password.trim() ? "" : "Password is required.",
    passwordMatch:
      password && confirmPassword && password !== confirmPassword
        ? "Passwords must match."
        : "",
  };
};

const Signup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    confirmPassword: "",
    email: "",
    password: "",
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      await createUser({
        email: email.trim(),
        password,
      });

      return createSession({
        email: email.trim(),
        password,
      });
    },
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
            400: "Unable to create account with those details. Try another email.",
          },
          default: "Unable to create your account right now. Try again.",
        }),
      );
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(email, password, confirmPassword);
    setFieldErrors({
      confirmPassword: nextErrors.confirmPassword || nextErrors.passwordMatch,
      email: nextErrors.email,
      password: nextErrors.password,
    });

    if (
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirmPassword ||
      nextErrors.passwordMatch
    ) {
      return;
    }

    try {
      await signupMutation.mutateAsync();
    } catch {
      return;
    }
  };

  return (
    <AuthShell
      cta={
        <div className="space-y-3">
          <p className="font-medium text-white">MVP signup</p>
          <p>
            Account creation is live in-app for internal users, and successful
            signup creates a session immediately before org onboarding is
            resolved.
          </p>
        </div>
      }
      description="Create your internal account, establish a real session automatically, and continue directly into organization setup if needed."
      eyebrow="MVP Signup"
      footerLabel="Already have an account?"
      footerText="Sign in"
      footerTo="/login"
      title="Create an internal account for Project CB."
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">
          Set up your account
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Successful signup continues into onboarding when no organization
          exists yet.
        </p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <FormField
          autoComplete="email"
          error={fieldErrors.email}
          id="signup-email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          type="email"
          value={email}
        />
        <FormField
          autoComplete="new-password"
          error={fieldErrors.password}
          helperText="Use a password you can remember for the MVP environment."
          id="signup-password"
          label="Password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          type="password"
          value={password}
        />
        <FormField
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          id="signup-password-confirm"
          label="Confirm password"
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your password"
          type="password"
          value={confirmPassword}
        />
        <Button
          className="w-full"
          isBusy={signupMutation.isPending}
          type="submit"
        >
          Create account
        </Button>
      </form>
      <div className="mt-6 text-sm text-slate-400">
        <Link
          className="text-sky-200 transition hover:text-sky-100"
          to="/login"
        >
          Already registered? Sign in here.
        </Link>
      </div>
    </AuthShell>
  );
};

export default Signup;
