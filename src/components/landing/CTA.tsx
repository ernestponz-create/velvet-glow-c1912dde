import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 container-elegant">
        <div className="glass-card p-10 md:p-16 lg:p-20 text-center max-w-4xl mx-auto">
          <p className="text-primary/80 text-sm tracking-[0.3em] uppercase mb-4">
            Begin Your Journey
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
            Ready to Experience
            <br />
            <span className="italic text-gradient">DermicaIQ Excellence?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join our private community of discerning individuals who expect nothing 
            less than perfection. Your consultation begins with a single step.
          </p>
          <Link to="/onboarding">
            <Button variant="velvet" size="xl" className="group">
              Request Private Consultation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
