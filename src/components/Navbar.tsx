import { Search, Menu, Bell, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-4 px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 hover:bg-secondary transition-colors">
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">H</span>
            </div>
            <span className="hidden font-heading text-xl font-bold text-foreground sm:block">
              Halal<span className="text-[hsl(var(--gold))]">Tube</span>
            </span>
          </Link>
        </div>

        {/* Center — Search */}
        <div className="flex max-w-xl flex-1 items-center">
          <form onSubmit={handleSearch} className="relative flex w-full">
            <input
              type="text"
              placeholder="Search halal content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-l-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button type="submit" className="flex h-10 items-center justify-center rounded-r-full border border-l-0 border-border bg-secondary px-5 hover:bg-muted transition-colors">
              <Search className="h-4 w-4 text-foreground" />
            </button>
          </form>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <button className="rounded-full p-2 hover:bg-secondary transition-colors">
                <Bell className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={signOut}
                className="rounded-full p-2 hover:bg-secondary transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5 text-foreground" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary transition-colors">
                <span className="text-xs font-bold text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <User className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
