import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface ProcedureFilterProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ProcedureFilter = ({ label, options, value, onChange, className }: ProcedureFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all",
          "bg-glass/60 border border-glass-border backdrop-blur-xl",
          "hover:border-primary/30 hover:bg-glass/80",
          value ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="truncate max-w-[120px]">{selectedLabel}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 min-w-[180px] p-1.5 rounded-xl bg-card border border-glass-border shadow-velvet">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value === value ? "" : option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  option.value === value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProcedureFilter;
