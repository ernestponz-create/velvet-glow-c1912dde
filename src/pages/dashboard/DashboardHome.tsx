import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, Search, MessageCircle } from "lucide-react";

const DashboardHome = () => {
  const { profile, user } = useAuth();
  
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";

  const quickActions = [
    { 
      title: "Book Consultation", 
      desc: "Schedule your next appointment",
      icon: Calendar,
      href: "/dashboard/discover",
      isExternal: false
    },
    { 
      title: "Browse Treatments", 
      desc: "Explore curated procedures",
      icon: Search,
      href: "/dashboard/discover",
      isExternal: false
    },
    { 
      title: "Contact Concierge", 
      desc: "24/7 WhatsApp support",
      icon: MessageCircle,
      href: "https://wa.me/972527496676",
      isExternal: true
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome section */}
      <div className="text-center py-20 md:py-32">
        {/* Decorative accent */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto border border-primary/20">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Welcome message */}
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-4">
          Welcome back, <span className="text-gradient italic">{displayName}</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          How may we perfect your beauty today?
        </p>

        {/* Subtle decorative line */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {quickActions.map((action) => {
          const CardContent = (
            <>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </>
          );

          if (action.isExternal) {
            return (
              <a
                key={action.title}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-6 hover:border-primary/30 transition-colors cursor-pointer group"
              >
                {CardContent}
              </a>
            );
          }

          return (
            <Link
              key={action.title}
              to={action.href}
              className="glass-card p-6 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              {CardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHome;
