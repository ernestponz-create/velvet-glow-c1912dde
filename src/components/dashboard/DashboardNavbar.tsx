import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SavingsIndicator from "./SavingsIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardNavbarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const DashboardNavbar = ({ onMobileMenuToggle, isMobileMenuOpen }: DashboardNavbarProps) => {
  const { profile, user } = useAuth();
  const isMobile = useIsMobile();
  
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 lg:h-16 bg-glass/60 backdrop-blur-2xl border-b border-glass-border">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="font-serif text-lg lg:text-xl font-medium tracking-tight text-foreground">
            Dermica<span className="text-primary">IQ</span>
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Savings indicator - desktop only */}
          <div className="hidden lg:block">
            <SavingsIndicator />
          </div>

          {/* Concierge chat - desktop only (in bottom nav on mobile) */}
          <Link
            to="/dashboard/concierge"
            className="hidden lg:flex relative p-2.5 rounded-xl bg-glass/60 border border-glass-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
          >
            <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </Link>

          {/* Profile avatar */}
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2 p-1.5 lg:pr-4 rounded-xl bg-glass/60 border border-glass-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">{initials}</span>
            </div>
            <span className="hidden lg:block text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[120px]">
              {displayName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
