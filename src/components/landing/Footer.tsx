import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="container-elegant">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-medium tracking-tight text-foreground">
              Velvet<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors underline-elegant">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors underline-elegant">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors underline-elegant">
              Contact
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Velvet Concierge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
