import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Procedure {
  id: string;
  name: string;
  slug: string;
  benefit_phrase: string;
  investment_level: string;
  concerns: string[];
  image_url: string | null;
}

interface ProcedureCardProps {
  procedure: Procedure;
  isRecommended?: boolean;
}

const investmentLabels: Record<string, string> = {
  signature: "Signature",
  premier: "Premier",
  exclusive: "Exclusive",
};

const ProcedureCard = ({ procedure, isRecommended }: ProcedureCardProps) => {
  return (
    <Link
      to={`/dashboard/discover/${procedure.slug}`}
      className="group block"
    >
      <article className="glass-card overflow-hidden transition-all duration-300 hover:border-primary/30 glow-hover">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary to-muted overflow-hidden">
          {/* Placeholder gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Cinematic overlay effect */}
          <div className="absolute inset-0 bg-primary/5 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Recommended badge */}
          {isRecommended && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                Recommended
              </span>
            </div>
          )}

          {/* Investment level badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-glass-border">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {investmentLabels[procedure.investment_level]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-xl md:text-2xl font-medium tracking-tight mb-2 group-hover:text-primary transition-colors">
            {procedure.name}
          </h3>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "{procedure.benefit_phrase}"
          </p>
        </div>
      </article>
    </Link>
  );
};

export default ProcedureCard;
