import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <span className="text-xl font-bold text-foreground">
      Recover<span className="text-primary">ly</span>
    </span>
    <span className="h-2 w-2 rounded-full bg-primary animate-glow-pulse" />
  </Link>
);

export default Logo;
