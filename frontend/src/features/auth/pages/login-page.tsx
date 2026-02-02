import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const otpSchema = z.object({
  token: z.string().length(6, "OTP must be 6 digits"),
});

type OTPForm = z.infer<typeof otpSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [requires2FA, setRequires2FA] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: "" },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.requires_2fa) {
        setRequires2FA(true);
        setUserEmail(loginForm.getValues("email"));
        toast.info("Please enter your 2FA code");
      } else {
        setUser(data.user!);
        toast.success("Login successful!");

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
      toast.error(error.response?.data?.detail || "Login failed");
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: authApi.verify2FA,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success("2FA verification successful!");

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
      toast.error(error.response?.data?.detail || "2FA verification failed");
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
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={otpForm.handleSubmit(onOTPSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="token">Authentication Code</Label>
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
              Verify
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setRequires2FA(false)}
            >
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
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
            Sign In
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
