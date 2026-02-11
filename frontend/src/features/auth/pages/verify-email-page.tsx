import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authApi } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error" | "expired"
  >("pending");

  const token = searchParams.get("token");

  const verifyMutation = useMutation({
    mutationFn: (token: string) => authApi.verifyEmail({ token }),
    onSuccess: () => {
      setVerificationStatus("success");
      toast.success(t("auth.emailVerified"));
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    },
    onError: (error: any) => {
      const errorDetail =
        error.response?.data?.detail || t("auth.verificationFailed");
      if (errorDetail.includes("expired")) {
        setVerificationStatus("expired");
      } else {
        setVerificationStatus("error");
      }
      toast.error(errorDetail);
    },
  });

  useEffect(() => {
    if (!token) {
      setVerificationStatus("error");
      toast.error(t("auth.invalidVerificationLink"));
      return;
    }
    // Automatically verify when component mounts
    verifyMutation.mutate(token);
  }, [token]);

  if (verificationStatus === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            {t("auth.emailVerified")}
          </CardTitle>
          <CardDescription>
            {t("auth.emailVerificationSuccess")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
            <p className="font-medium">{t("auth.redirectingToLogin")}</p>
          </div>
          <Button className="w-full" onClick={() => navigate("/login")}>
            {t("auth.goToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (verificationStatus === "expired") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-600" />
            {t("auth.verificationExpired")}
          </CardTitle>
          <CardDescription>{t("auth.linkExpiredDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-orange-50 p-4 text-sm text-orange-800">
            <p className="font-medium mb-2">{t("auth.tokenExpired")}</p>
            <p className="text-orange-700">
              {t("auth.requestNewVerificationEmail")}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate("/resend-verification")}
          >
            {t("auth.resendVerificationEmail")}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/register")}
          >
            {t("auth.registerAgain")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (verificationStatus === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-600" />
            {t("auth.verificationFailed")}
          </CardTitle>
          <CardDescription>{t("auth.invalidVerificationLink")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <p className="font-medium mb-2">
              {t("auth.invalidOrExpiredToken")}
            </p>
            <p className="text-red-700">{t("auth.tryResendingEmail")}</p>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate("/resend-verification")}
          >
            {t("auth.resendVerificationEmail")}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            {t("auth.backToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Pending state - showing loading
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          {t("auth.verifyingEmail")}
        </CardTitle>
        <CardDescription>{t("auth.pleaseWait")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium">{t("auth.processingVerification")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
