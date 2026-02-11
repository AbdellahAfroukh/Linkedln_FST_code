import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, Mail } from "lucide-react";

const resendSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("auth.email")),
  });

type ResendForm = z.infer<typeof resendSchema>;

export function ResendVerificationPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const defaultEmail = location.state?.email || "";

  const form = useForm<ResendForm>({
    resolver: zodResolver(resendSchema(t)),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const resendMutation = useMutation({
    mutationFn: (email: string) => authApi.resendVerificationEmail(email),
    onSuccess: () => {
      setEmailSent(true);
      toast.success(t("auth.verificationEmailSent"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || t("auth.failedToSendEmail"));
    },
  });

  const onSubmit = (data: ResendForm) => {
    resendMutation.mutate(data.email);
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" />
            {t("auth.emailSent")}
          </CardTitle>
          <CardDescription>{t("auth.checkYourEmail")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">{t("auth.newVerificationSent")}</p>
            <p className="text-blue-700">{form.getValues("email")}</p>
            <p className="text-blue-600 mt-2 text-xs">
              {t("auth.verificationLinkExpires")}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">{t("auth.didntWork")}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                form.reset();
              }}
            >
              {t("auth.tryAnotherEmail")}
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            {t("auth.alreadyVerified")}{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              {t("auth.signIn")}
            </button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.resendVerification")}</CardTitle>
        <CardDescription>{t("auth.enterEmailToResend")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full"
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("auth.resendVerificationEmail")}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {t("auth.rememberPassword")}{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              {t("auth.signIn")}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
