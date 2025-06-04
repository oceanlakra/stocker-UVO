import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-2xl">Stocker</Link>
        <nav className="flex gap-4">
          <Button asChild variant="ghost">
            <Link to="/analysis">Analysis</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/comparison">Comparison</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/prediction">Prediction</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}