import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - simplified on mobile */}
      <DashboardNavbar
        onMobileMenuToggle={() => {}}
        isMobileMenuOpen={false}
      />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64",
          isMobile && "pb-24" // Space for bottom nav
        )}
      >
        <div className={cn(
          "p-4 md:p-8 lg:p-10",
          isMobile && "px-4 py-4"
        )}>
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
