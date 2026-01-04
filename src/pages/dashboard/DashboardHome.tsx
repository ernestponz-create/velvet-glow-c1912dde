import { useAuth } from "@/hooks/useAuth";
import { Sparkles } from "lucide-react";

const DashboardHome = () => {
  const { profile, user } = useAuth();
  
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";

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

      {/* Quick actions placeholder */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[
          { title: "Book Consultation", desc: "Schedule your next appointment" },
          { title: "Browse Treatments", desc: "Explore curated procedures" },
          { title: "Contact Concierge", desc: "24/7 personalized support" },
        ].map((action) => (
          <div
            key={action.title}
            className="glass-card p-6 hover:border-primary/30 transition-colors cursor-pointer group"
          >
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground">{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
