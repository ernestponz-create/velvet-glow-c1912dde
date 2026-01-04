import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, User, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import SavingsIndicator from "./SavingsIndicator";

interface DashboardNavbarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const DashboardNavbar = ({ onMobileMenuToggle, isMobileMenuOpen }: DashboardNavbarProps) => {
  const { profile, user } = useAuth();
  
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-glass/60 backdrop-blur-2xl border-b border-glass-border">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left: Logo + Mobile menu */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-xl font-medium tracking-tight text-foreground">
              Velvet<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Savings indicator - desktop */}
          <div className="hidden sm:block">
            <SavingsIndicator />
          </div>

          {/* Concierge chat */}
          <Link
            to="/dashboard/concierge"
            className="relative p-2.5 rounded-xl bg-glass/60 border border-glass-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
          >
            <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </Link>

          {/* Profile avatar */}
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-glass/60 border border-glass-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">{initials}</span>
            </div>
            <span className="hidden sm:block text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[120px]">
              {displayName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
