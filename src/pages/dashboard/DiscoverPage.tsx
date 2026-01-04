import { Sparkles } from "lucide-react";

const DiscoverPage = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-3">
        Discover Procedures
      </h1>
      <p className="text-muted-foreground">
        Explore our curated selection of premium cosmetic treatments.
      </p>
    </div>
  );
};

export default DiscoverPage;
