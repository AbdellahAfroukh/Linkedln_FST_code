import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api";
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

const registerSchema = (t: (key: string) => string) =>
  z
    .object({
      fullName: z.string().min(2, t("auth.fullName")),
      email: z.string().email(t("auth.email")),
      password: z.string().min(8, t("auth.password")),
      confirmPassword: z.string(),
      user_type: z.enum(["enseignant", "doctorant"]),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.confirmPassword"),
      path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema(t)),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      user_type: "enseignant",
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success(t("auth.registrationSuccessful"));
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || t("auth.registrationFailed"));
    },
  });

  const onSubmit = (data: RegisterForm) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.createAccount")}</CardTitle>
        <CardDescription>{t("auth.joinCommunity")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("auth.fullName")}</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_type">{t("auth.accountType")}</Label>
            <select
              id="user_type"
              {...form.register("user_type")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="enseignant">{t("auth.enseignant")}</option>
              <option value="doctorant">{t("auth.doctorant")}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("auth.createAccount")}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {t("auth.haveAccount")}{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              {t("auth.signIn")}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
