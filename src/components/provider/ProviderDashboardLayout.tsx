import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProviderDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { providerProfile, signOut } = useProviderAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isMultiStaff = providerProfile?.practice_type === "multi_staff";

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/provider-dashboard" },
    { icon: Calendar, label: "My Availability", path: "/provider-dashboard/availability" },
    { icon: ClipboardList, label: "Bookings & Requests", path: "/provider-dashboard/bookings" },
    ...(isMultiStaff ? [{ icon: Users, label: "Staff", path: "/provider-dashboard/staff" }] : []),
    { icon: Building2, label: "My Clinic Profile", path: "/provider-dashboard/profile" },
    { icon: Settings, label: "Settings", path: "/provider-dashboard/settings" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white/70 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/provider-dashboard" className="font-serif text-lg font-medium text-white">
            Dermica<span className="text-[#d4af37]">IQ</span>
            <span className="text-white/40 text-sm ml-2">Provider</span>
          </Link>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-[#1a1a2e] border-r border-white/10 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/provider-dashboard" className="font-serif text-xl font-medium text-white">
              Dermica<span className="text-[#d4af37]">IQ</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clinic Name */}
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Clinic</p>
            <p className="text-white font-medium truncate">{providerProfile?.clinic_name}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive
                      ? "bg-[#d4af37]/10 text-[#d4af37]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default ProviderDashboardLayout;
