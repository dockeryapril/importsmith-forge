import { Link, useLocation } from "react-router-dom";
import { Anvil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Anvil className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold text-foreground">ImportSmith</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/">
              <Button variant={isLanding ? "secondary" : "ghost"} size="sm">Home</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} size="sm">Dashboard</Button>
            </Link>
            <Link to="/history">
              <Button variant={pathname === "/history" ? "secondary" : "ghost"} size="sm">History</Button>
            </Link>
            <Link to="/description-formatter">
              <Button variant={pathname === "/description-formatter" ? "secondary" : "ghost"} size="sm">Description Formatter</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className={cn("ml-2 bg-accent text-accent-foreground hover:bg-accent/90")}>
                Try the Tool
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
