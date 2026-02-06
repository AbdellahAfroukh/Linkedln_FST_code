import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/api/stats";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  MessageSquare,
  FolderKanban,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
  FlaskConical,
  Network,
  UserCheck,
} from "lucide-react";

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => statsApi.getPlatformStats(),
  });

  const features = [
    {
      icon: Network,
      title: t("dashboard.academicNetworking"),
      description: t("dashboard.academicNetworkingDesc"),
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: FileText,
      title: t("dashboard.researchSharing"),
      description: t("dashboard.researchSharingDesc"),
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: MessageSquare,
      title: t("dashboard.realtimeCollaboration"),
      description: t("dashboard.realtimeCollaborationDesc"),
      color: "from-purple-500 to-violet-600",
    },
    {
      icon: FolderKanban,
      title: t("dashboard.projectManagement"),
      description: t("dashboard.projectManagementDesc"),
      color: "from-orange-500 to-red-600",
    },
    {
      icon: GraduationCap,
      title: t("dashboard.googleScholarIntegration"),
      description: t("dashboard.googleScholarIntegrationDesc"),
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: UserCheck,
      title: t("dashboard.smartProfileMatching"),
      description: t("dashboard.smartProfileMatchingDesc"),
      color: "from-teal-500 to-cyan-600",
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="border-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                {t("dashboard.yourAcademicCommunity")}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {t("common.welcome")}, {user?.fullName}!
              </h1>
              <p className="text-gray-600 text-lg">
                {user?.profile_completed
                  ? t("dashboard.discoverConnect")
                  : t("dashboard.completeProfileMessage")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/feed">
                  {t("dashboard.exploreFeed")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/people">{t("dashboard.researchers")}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {t("dashboard.community")}
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {stats.users.total}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {t("dashboard.activeMembers")}
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {t("dashboard.universities")}
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {stats.organisation.universities}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {t("dashboard.institutions")}
                  </p>
                </div>
                <Building2 className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    {t("dashboard.researchLabs")}
                  </p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {stats.organisation.laboratoires}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {t("dashboard.laboratories")}
                  </p>
                </div>
                <FlaskConical className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    {t("dashboard.knowledge")}
                  </p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">
                    {stats.content.posts}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {t("dashboard.sharedInsights")}
                  </p>
                </div>
                <FileText className="h-12 w-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("dashboard.everythingYouNeed")}
          </h2>
          <p className="text-gray-600">{t("dashboard.completePlatform")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="relative overflow-hidden">
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.color}`}
              />
              <CardHeader>
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} mb-3`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <CardContent className="p-8 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("dashboard.readyToMakeImpact")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("dashboard.joinConversation")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/feed">{t("dashboard.viewFeed")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/connections">{t("dashboard.myConnections")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/projets">{t("dashboard.manageProjects")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
