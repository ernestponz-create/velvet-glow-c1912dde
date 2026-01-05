import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-xl border-b border-border/50">
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
            <Link 
              to="/signin" 
              className="hidden sm:inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
            >
              Sign In
            </Link>
            <Link 
              to="/onboarding" 
              className="inline-flex items-center justify-center h-9 px-3 rounded-md text-xs font-medium tracking-wider uppercase bg-transparent border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              Request Access
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
