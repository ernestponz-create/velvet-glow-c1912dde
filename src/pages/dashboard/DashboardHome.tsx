import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, Search, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MembershipTierCard, { TierProgressCard } from "@/components/membership/MembershipTierCard";

const DashboardHome = () => {
  const { profile, user } = useAuth();
  const isMobile = useIsMobile();
  
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";

  const quickActions = [
    { 
      title: "Book Consultation", 
      desc: "Schedule your next appointment",
      icon: Calendar,
      href: "/dashboard/quick-book",
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="pt-2">
        {/* Compact welcome */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <MembershipTierCard 
              currentTier={profile?.computed_tier} 
              totalSpend={profile?.total_spend} 
              compact 
            />
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-tight mb-2">
            Welcome, <span className="text-gradient italic">{displayName}</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            How may we help you today?
          </p>
        </div>

        {/* Membership Card */}
        <div className="mb-4">
          <MembershipTierCard 
            currentTier={profile?.computed_tier} 
            totalSpend={profile?.total_spend} 
          />
        </div>

        {/* Quick actions - stacked cards */}
        <div className="space-y-3">
          {quickActions.map((action) => {
            const CardContent = (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </div>
            );

            const cardClasses = "glass-card p-4 block border-primary/10 active:scale-[0.98] transition-transform";

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
              <Link key={action.title} to={action.href} className={cardClasses}>
                {CardContent}
              </Link>
            );
          })}
        </div>

        {/* Tier Progress below quick actions */}
        <div className="mt-4">
          <TierProgressCard 
            currentTier={profile?.computed_tier} 
            totalSpend={profile?.total_spend} 
          />
        </div>
      </div>
    );
  }

  // Desktop Layout
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

      {/* Membership Tier Card */}
      <div className="max-w-md mx-auto mb-8">
        <MembershipTierCard 
          currentTier={profile?.computed_tier} 
          totalSpend={profile?.total_spend} 
        />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quickActions.map((action) => {
          const CardContent = (
            <>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                <action.icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </>
          );

          const cardClasses = "glass-card p-6 group cursor-pointer border-primary/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-300";

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

      {/* Tier Progress below quick actions */}
      <div className="mt-6 max-w-md mx-auto">
        <TierProgressCard 
          currentTier={profile?.computed_tier} 
          totalSpend={profile?.total_spend} 
        />
      </div>
    </div>
  );
};

export default DashboardHome;
