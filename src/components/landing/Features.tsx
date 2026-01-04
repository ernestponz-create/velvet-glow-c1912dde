import { Sparkles, Clock, Heart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Tailored Recommendations",
      description:
        "Every treatment plan is crafted to your unique needs. Our experts match you with specialists who understand your aesthetic vision.",
    },
    {
      icon: Clock,
      title: "Priority Access",
      description:
        "Skip the waitlists. As a Velvet member, you receive priority scheduling at the world's most sought-after clinics.",
    },
    {
      icon: Heart,
      title: "Post-Treatment Care",
      description:
        "Your journey continues after treatment. Enjoy dedicated follow-up care and 24/7 access to your personal concierge.",
    },
  ];

  return (
    <section id="services" className="section-padding">
      <div className="container-elegant">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-primary/80 text-sm tracking-[0.3em] uppercase mb-4">
            The Velvet Experience
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">
            Exceptional Care,
            <br />
            <span className="italic text-gradient">Every Detail</span>
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-8 lg:p-10 glow-hover group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl md:text-2xl font-medium mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
