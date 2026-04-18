import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 50]);

  const category = params.get("category") || "all";
  const q = params.get("q") || "";
  const sort = params.get("sort") || "featured";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/products/categories");
        setCategories([{ name: "all", count: 0 }, ...data]);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      try {
        const { data } = await api.get("/products", {
          params: {
            category,
            q: q || undefined,
            sort,
            min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
            max_price: priceRange[1] < 50 ? priceRange[1] : undefined,
            limit: 60,
          },
        });
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetch, 150);
    return () => clearTimeout(t);
  }, [category, q, sort, priceRange]);

  const updateParam = (k, v) => {
    const n = new URLSearchParams(params);
    if (!v || v === "all") n.delete(k);
    else n.set(k, v);
    setParams(n);
  };

  const FilterPanel = () => (
    <div className="space-y-6 p-1" data-testid="filter-panel">
      <div>
        <div className="label-eyebrow mb-3">Search</div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            defaultValue={q}
            placeholder="Search products..."
            className="pl-10 h-11 rounded-full"
            onChange={(e) => updateParam("q", e.target.value)}
            data-testid="filter-search"
          />
        </div>
      </div>
      <div>
        <div className="label-eyebrow mb-3">Categories</div>
        <div className="flex flex-col gap-1">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => updateParam("category", c.name)}
              className={`text-left px-3 py-2 rounded-xl text-sm font-bold flex justify-between items-center transition ${category === c.name ? "bg-nigeria-dark text-white" : "hover:bg-nigeria-dark/5 text-nigeria-dark"}`}
              data-testid={`filter-cat-${c.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
            >
              <span className="capitalize">{c.name === "all" ? "All products" : c.name}</span>
              {c.count > 0 && <span className="text-xs opacity-60">{c.count}</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="label-eyebrow mb-3">Price: ${priceRange[0]} – ${priceRange[1]}+</div>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={50} step={1} className="mt-3" data-testid="filter-price" />
      </div>
      <Button variant="outline" onClick={() => { setParams({}); setPriceRange([0, 50]); }} className="w-full rounded-full" data-testid="filter-clear">
        <X className="w-4 h-4 mr-1" /> Clear filters
      </Button>
    </div>
  );

  return (
    <div data-testid="shop-page">
      <section className="bg-nigeria-cream border-b border-black/5 py-10 md:py-16">
        <div className="brianna-container">
          <div className="label-eyebrow text-nigeria-orange mb-3">Shop</div>
          <h1 className="font-display font-black text-4xl md:text-6xl text-nigeria-dark tracking-tight">
            {category === "all" ? "All products" : category}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">{q ? `Results for "${q}"` : "500+ authentic Nigerian staples, shipped worldwide."}</p>
        </div>
      </section>

      <section className="brianna-container py-10">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          <aside className="hidden lg:block sticky top-24 self-start" data-testid="desktop-filters">
            <FilterPanel />
          </aside>
          <div>
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="text-sm text-muted-foreground" data-testid="product-count">
                <span className="font-black text-nigeria-dark">{products.length}</span> products
              </div>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden rounded-full" data-testid="mobile-filter-btn">
                      <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85%] sm:max-w-sm">
                    <SheetHeader><SheetTitle className="font-display text-2xl">Filters</SheetTitle></SheetHeader>
                    <div className="mt-6"><FilterPanel /></div>
                  </SheetContent>
                </Sheet>
                <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
                  <SelectTrigger className="w-44 rounded-full" data-testid="sort-select">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="new">Newest</SelectItem>
                    <SelectItem value="price_asc">Price: low to high</SelectItem>
                    <SelectItem value="price_desc">Price: high to low</SelectItem>
                    <SelectItem value="rating">Top rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20" data-testid="no-products">
                <div className="text-6xl mb-4">🍲</div>
                <h3 className="font-display text-2xl font-black text-nigeria-dark">Nothing here yet</h3>
                <p className="text-muted-foreground mt-2">Try a different search or clear your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" data-testid="products-grid">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
