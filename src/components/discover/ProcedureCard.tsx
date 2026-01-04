import { Sparkles } from "lucide-react";
import { procedureImages } from "@/assets/procedures";
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
  onClick?: () => void;
  compact?: boolean;
}

const investmentLabels: Record<string, string> = {
  signature: "Signature",
  premier: "Premier",
  exclusive: "Exclusive",
};

const ProcedureCard = ({ procedure, isRecommended, onClick, compact }: ProcedureCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group block text-left w-full"
    >
      <article className="glass-card overflow-hidden transition-all duration-300 hover:border-primary/30 glow-hover h-full">
        {/* Image */}
        <div className={cn(
          "relative bg-gradient-to-br from-secondary to-muted overflow-hidden",
          compact ? "aspect-square" : "aspect-[4/3]"
        )}>
          {/* Procedure image */}
          {procedureImages[procedure.slug] && (
            <img 
              src={procedureImages[procedure.slug]} 
              alt={procedure.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Cinematic overlay effect */}
          <div className="absolute inset-0 bg-primary/5 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Recommended badge */}
          {isRecommended && (
            <div className={cn(
              "absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-sm",
              compact && "px-1.5"
            )}>
              <Sparkles className={cn("text-primary-foreground", compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
              {!compact && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                  Recommended
                </span>
              )}
            </div>
          )}

          {/* Investment level badge */}
          <div className={cn(
            "absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/60 backdrop-blur-sm border border-glass-border",
            compact && "px-1.5"
          )}>
            <span className={cn(
              "font-medium uppercase tracking-wider text-muted-foreground",
              compact ? "text-[8px]" : "text-[10px]"
            )}>
              {investmentLabels[procedure.investment_level]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={cn("p-4", compact ? "p-3" : "p-5")}>
          <h3 className={cn(
            "font-serif font-medium tracking-tight mb-1 group-hover:text-primary transition-colors",
            compact ? "text-sm" : "text-xl md:text-2xl mb-2"
          )}>
            {procedure.name}
          </h3>
          {!compact && (
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              "{procedure.benefit_phrase}"
            </p>
          )}
        </div>
      </article>
    </button>
  );
};

export default ProcedureCard;
