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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {quickActions.map((action) => {
          const cardClasses = `
            relative p-6 rounded-2xl cursor-pointer group
            bg-glass/60 backdrop-blur-xl
            border border-primary/20
            shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_1px_rgba(212,175,55,0.2)]
            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            hover:-translate-y-1
            hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.15)]
            hover:border-primary/40
            hover:bg-white/[0.03]
            active:translate-y-0 active:scale-[0.98]
            active:shadow-[0_2px_10px_rgba(0,0,0,0.3)]
          `;

          const CardContent = (
            <>
              {/* Gradient border top accent */}
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
              
              {/* Icon with glow */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:bg-primary/15 transition-all duration-300">
                <action.icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              
              {/* Title with letter spacing */}
              <h3 className="font-medium text-foreground tracking-wide group-hover:text-primary transition-colors duration-300 mb-1.5">
                {action.title}
              </h3>
              
              {/* Subtitle with better visibility */}
              <p className="text-sm text-foreground/60">{action.desc}</p>
            </>
          );

          if (action.isExternal) {
            return (
              <a
                key={action.title}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClasses}
              >
                {CardContent}
              </a>
            );
          }

          return (
            <Link
              key={action.title}
              to={action.href}
              className={cardClasses}
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
