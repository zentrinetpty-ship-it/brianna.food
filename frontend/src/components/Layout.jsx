import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Search, ShoppingBag, User, Menu, X, Heart, Package, LogOut, MapPin, Sparkles, Instagram, Facebook, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { AiChat } from "@/components/AiChat";
import { Toaster } from "sonner";
import Marquee from "react-fast-marquee";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/monthly-box", label: "Monthly Box" },
  { to: "/recipes", label: "Recipes" },
  { to: "/about", label: "About" },
];

function TopBanner() {
  return (
    <div className="bg-nigeria-dark text-white text-xs md:text-sm overflow-hidden" data-testid="top-banner">
      <Marquee pauseOnHover gradient={false} speed={40} className="py-2">
        <span className="mx-8 font-bold tracking-wider">FREE SHIPPING ON ORDERS OVER $79 WORLDWIDE</span>
        <span className="mx-8 text-nigeria-lime">•</span>
        <span className="mx-8 font-bold tracking-wider">USE CODE <span className="text-nigeria-lime">NAIJA10</span> FOR 10% OFF</span>
        <span className="mx-8 text-nigeria-lime">•</span>
        <span className="mx-8 font-bold tracking-wider">AUTHENTIC NIGERIAN GROCERIES DELIVERED IN 3-5 DAYS</span>
        <span className="mx-8 text-nigeria-lime">•</span>
        <span className="mx-8 font-bold tracking-wider">MONTHLY BOX FROM $49.99</span>
        <span className="mx-8 text-nigeria-lime">•</span>
      </Marquee>
    </div>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm" : "bg-nigeria-cream"}`}
      data-testid="site-header"
    >
      <div className="brianna-container flex items-center gap-4 py-4">
        <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-nigeria-lime flex items-center justify-center font-black text-nigeria-dark text-xl shadow-[0_4px_12px_rgba(149,214,0,0.4)] group-hover:rotate-12 transition-transform duration-300">
              B
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-nigeria-orange border-2 border-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-black text-xl text-nigeria-dark">Brianna</span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-nigeria-orange -mt-0.5">.APP</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-6" data-testid="desktop-nav">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive ? "bg-nigeria-dark text-white" : "text-nigeria-dark hover:bg-nigeria-dark/5"}`
              }
              data-testid={`nav-${l.label.toLowerCase().replace(" ", "-")}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md ml-auto relative" data-testid="search-form">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search egusi, stockfish, ogbono..."
            className="pl-11 pr-4 h-11 rounded-full bg-white border-2 border-transparent focus-visible:border-nigeria-lime focus-visible:ring-0 font-medium"
            data-testid="search-input"
          />
        </form>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          {user && user !== false ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 bg-nigeria-dark/5 hover:bg-nigeria-dark/10" data-testid="account-menu-btn">
                  <User className="w-5 h-5 text-nigeria-dark" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl" data-testid="account-dropdown">
                <DropdownMenuLabel className="font-heading">Hey, {user.name?.split(" ")[0] || "friend"}!</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/account")} data-testid="menu-account">
                  <User className="w-4 h-4 mr-2" /> My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/account?tab=orders")} data-testid="menu-orders">
                  <Package className="w-4 h-4 mr-2" /> Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/account?tab=wishlist")} data-testid="menu-wishlist">
                  <Heart className="w-4 h-4 mr-2" /> Wishlist
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                      <Sparkles className="w-4 h-4 mr-2" /> Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-nigeria-dark hover:bg-nigeria-dark/5 transition" data-testid="login-link">
              <User className="w-4 h-4" /> Sign in
            </Link>
          )}

          <button
            onClick={() => setOpen(true)}
            className="relative rounded-full h-11 w-11 flex items-center justify-center bg-nigeria-lime hover:bg-[#7CB342] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(149,214,0,0.4)]"
            data-testid="cart-button"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5 text-nigeria-dark" />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-nigeria-orange text-white text-[11px] font-black flex items-center justify-center"
                data-testid="cart-count"
              >
                {count}
              </motion.span>
            )}
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-11 w-11" data-testid="mobile-menu-btn">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88%] sm:max-w-sm" data-testid="mobile-menu">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                <form onSubmit={submitSearch} className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="pl-11 h-12 rounded-full bg-muted"
                    data-testid="mobile-search-input"
                  />
                </form>
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-lg font-bold ${isActive ? "bg-nigeria-dark text-white" : "text-nigeria-dark hover:bg-nigeria-dark/5"}`
                    }
                    data-testid={`mobile-nav-${l.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {l.label}
                  </NavLink>
                ))}
                {!(user && user !== false) && (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="mt-4 px-4 py-3 rounded-xl text-lg font-bold bg-nigeria-lime text-nigeria-dark text-center"
                    data-testid="mobile-login"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-nigeria-dark text-white relative overflow-hidden mt-16" data-testid="site-footer">
      <div className="absolute inset-0 ankara-pattern opacity-10" />
      <div className="brianna-container relative py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-nigeria-lime flex items-center justify-center font-black text-nigeria-dark text-2xl">B</div>
              <div>
                <div className="font-display font-black text-2xl">Brianna</div>
                <div className="text-[10px] font-bold tracking-[0.3em] text-nigeria-lime -mt-1">.APP</div>
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Authentic Nigerian groceries, soups and spices delivered to your doorstep — anywhere in the world. A taste of home, a click away.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-nigeria-lime hover:text-nigeria-dark flex items-center justify-center transition" data-testid={`social-${i}`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="label-eyebrow !text-nigeria-lime mb-4">Shop</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/shop?category=Soup Ingredients" className="hover:text-nigeria-lime">Soup Ingredients</Link></li>
              <li><Link to="/shop?category=Proteins" className="hover:text-nigeria-lime">Proteins</Link></li>
              <li><Link to="/shop?category=Grains %26 Flours" className="hover:text-nigeria-lime">Grains & Flours</Link></li>
              <li><Link to="/shop?category=Snacks" className="hover:text-nigeria-lime">Snacks</Link></li>
              <li><Link to="/shop" className="hover:text-nigeria-lime">Shop all</Link></li>
            </ul>
          </div>
          <div>
            <div className="label-eyebrow !text-nigeria-lime mb-4">Company</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/about" className="hover:text-nigeria-lime">About</Link></li>
              <li><Link to="/monthly-box" className="hover:text-nigeria-lime">Monthly Box</Link></li>
              <li><Link to="/recipes" className="hover:text-nigeria-lime">Recipes</Link></li>
              <li><a href="#" className="hover:text-nigeria-lime">Careers</a></li>
            </ul>
          </div>
          <div>
            <div className="label-eyebrow !text-nigeria-lime mb-4">Support</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-nigeria-lime">Shipping</a></li>
              <li><a href="#" className="hover:text-nigeria-lime">Returns</a></li>
              <li><a href="#" className="hover:text-nigeria-lime">FAQ</a></li>
              <li><a href="#" className="hover:text-nigeria-lime">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <MapPin className="w-3.5 h-3.5" /> Shipping to 40+ countries worldwide
          </div>
          <p className="text-white/60 text-xs">© {new Date().getFullYear()} Brianna.app — Made with ❤️ for the diaspora.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col" data-testid="app-layout">
      <TopBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <AiChat />
      <Toaster richColors position="top-right" />
    </div>
  );
}
