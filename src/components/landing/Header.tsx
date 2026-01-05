import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container-elegant">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl md:text-2xl font-medium tracking-tight text-foreground">
              Dermica<span className="text-primary">IQ</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-elegant">
              Services
            </a>
            <a href="#approach" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-elegant">
              Our Approach
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-elegant">
              Contact
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button variant="elegant" size="sm" asChild>
              <Link to="/onboarding">Request Access</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
