import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Gift, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Sparkles, label: "Discover", path: "/dashboard/discover" },
  { icon: Calendar, label: "Book", path: "/dashboard/quick-book" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: Gift, label: "Benefits", path: "/dashboard/benefits" },
];

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-glass-border" />
      
      {/* Safe area padding for iPhone */}
      <div className="relative flex items-center justify-around px-2 pt-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-all",
                  active && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                active && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
