import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Sparkles, 
  MessageCircle, 
  Calendar, 
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Sparkles, label: "Browse Treatments", path: "/dashboard/discover" },
  { icon: Calendar, label: "Book Treatment", path: "/dashboard/quick-book" },
  { icon: MessageCircle, label: "My Concierge", path: "/dashboard/concierge" },
  { icon: Heart, label: "Bookings", path: "/dashboard/bookings" },
];

const DashboardSidebar = ({ isCollapsed, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-40 flex flex-col transition-all duration-300 ease-out",
        "bg-glass/40 backdrop-blur-2xl border-r border-glass-border",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 p-3 pt-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", active && "text-primary")} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {active && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-glass-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
