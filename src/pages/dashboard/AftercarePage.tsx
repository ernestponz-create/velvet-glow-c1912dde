import { Heart } from "lucide-react";

const AftercarePage = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Heart className="w-7 h-7 text-primary" />
      </div>
      <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-3">
        Aftercare
      </h1>
      <p className="text-muted-foreground">
        Post-treatment guidance and recovery resources.
      </p>
    </div>
  );
};

export default AftercarePage;
