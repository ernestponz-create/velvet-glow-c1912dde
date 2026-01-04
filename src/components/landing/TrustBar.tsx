const TrustBar = () => {
  const partners = [
    "Swiss Aesthetic Institute",
    "London Harley Street",
    "Beverly Hills Elite",
    "Monaco Wellness",
    "Tokyo Precision",
  ];

  return (
    <section className="py-16 border-y border-border/30 bg-secondary/30">
      <div className="container-elegant">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8">
          Partnered with World-Class Clinics
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((partner, index) => (
            <div
              key={partner}
              className="text-muted-foreground/50 text-sm font-medium tracking-wide hover:text-muted-foreground transition-colors cursor-default"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
