import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © 2025 Recoverly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
