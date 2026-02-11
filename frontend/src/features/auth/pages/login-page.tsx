import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

const loginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("auth.email")),
    password: z.string().min(1, t("auth.password")),
  });

type LoginForm = z.infer<typeof loginSchema>;

const otpSchema = (t: (key: string) => string) =>
  z.object({
    token: z.string().length(6, t("auth.authenticationCode")),
  });

type OTPForm = z.infer<typeof otpSchema>;

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [requires2FA, setRequires2FA] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema(t)),
    defaultValues: { token: "" },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.requires_2fa) {
        setRequires2FA(true);
        setUserEmail(loginForm.getValues("email"));
        toast.info(t("auth.enter2FACode"));
      } else {
        setUser(data.user!);
        toast.success(t("auth.loginSuccessful"));

        // Admin users go directly to admin dashboard
        if (data.user?.user_type === "admin") {
          navigate("/admin");
        } else {
          // Regular users check profile completion
          navigate(
            data.user?.profile_completed ? "/dashboard" : "/complete-profile",
          );
        }
      }
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || t("auth.loginFailed");

      // Handle email not verified error
      if (
        error.response?.status === 403 &&
        errorDetail.includes("Email not verified")
      ) {
        setEmailNotVerified(true);
        setUserEmail(loginForm.getValues("email"));
        toast.error(errorDetail);
      } else {
        toast.error(errorDetail);
      }
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: authApi.verify2FA,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success(t("auth.verificationSuccessful"));

      // Admin users go directly to admin dashboard
      if (data.user.user_type === "admin") {
        navigate("/admin");
      } else {
        // Regular users check profile completion
        navigate(
          data.user.profile_completed ? "/dashboard" : "/complete-profile",
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || t("auth.verificationFailed"));
    },
  });

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onOTPSubmit = (data: OTPForm) => {
    // Strip whitespace and ensure it's 6 digits
    const cleanToken = data.token.replace(/\s/g, "");
    verify2FAMutation.mutate({ email: userEmail, token: cleanToken });
  };

  if (requires2FA) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.twoFactorAuth")}</CardTitle>
          <CardDescription>{t("auth.enterAuthCode")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={otpForm.handleSubmit(onOTPSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="token">{t("auth.authenticationCode")}</Label>
              <Input
                id="token"
                type="text"
                maxLength={6}
                placeholder="000000"
                {...otpForm.register("token")}
              />
              {otpForm.formState.errors.token && (
                <p className="text-sm text-red-600">
                  {otpForm.formState.errors.token.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={verify2FAMutation.isPending}
            >
              {verify2FAMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("auth.verify")}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setRequires2FA(false)}
            >
              {t("auth.backToLogin")}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Show email not verified error
  if (emailNotVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            {t("auth.emailNotVerified")}
          </CardTitle>
          <CardDescription>{t("auth.pleaseVerifyEmail")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-orange-50 p-4 text-sm text-orange-800">
            <p className="font-medium mb-2">{t("auth.verificationRequired")}</p>
            <p className="text-orange-700">{userEmail}</p>
          </div>

          <Button
            className="w-full"
            onClick={() =>
              navigate("/resend-verification", { state: { email: userEmail } })
            }
          >
            {t("auth.resendVerificationEmail")}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailNotVerified(false);
              loginForm.reset();
            }}
          >
            {t("auth.backToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.welcomeBack")}</CardTitle>
        <CardDescription>{t("auth.signInToContinue")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-sm text-red-600">
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-sm text-red-600">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("auth.signIn")}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              {t("auth.signUpButton")}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
