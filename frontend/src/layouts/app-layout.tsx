import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  FolderKanban,
  GraduationCap,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/posts", icon: FileText, label: "Posts" },
    { to: "/connections", icon: Users, label: "Connections" },
    { to: "/chats", icon: MessageSquare, label: "Messages" },
    { to: "/projets", icon: FolderKanban, label: "Projects" },
    { to: "/cv", icon: UserCircle, label: "My CV" },
    { to: "/google-scholar", icon: GraduationCap, label: "Google Scholar" },
  ];

  if (user?.user_type === "admin") {
    navItems.push({ to: "/admin", icon: Shield, label: "Admin Panel" });
  } else {
    navItems.push({
      to: "/profile/settings",
      icon: Settings,
      label: "Profile Settings",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline">
                Academic Platform
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
              {user?.photoDeProfil ? (
                <img
                  src={user.photoDeProfil}
                  alt={user.fullName || "User"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {userInitials}
                </span>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.user_type}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto mt-[57px] lg:mt-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
