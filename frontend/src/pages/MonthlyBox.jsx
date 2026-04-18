import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Package, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

export default function MonthlyBox() {
  const [tiers, setTiers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(null);
  const [mode, setMode] = useState("tiers"); // tiers | custom

  useEffect(() => {
    (async () => {
      const [t, p] = await Promise.all([
        api.get("/subscriptions/tiers"),
        api.get("/products", { params: { limit: 24 } }),
      ]);
      setTiers(t.data);
      setProducts(p.data);
    })();
  }, []);

  const subscribe = async (tier_id) => {
    try {
      setLoading(tier_id);
      const { data } = await api.post("/checkout/subscription", {
        origin_url: window.location.origin,
        tier_id,
      });
      window.location.href = data.url;
    } catch (e) {
      setLoading(null);
    }
  };

  return (
    <div data-testid="monthly-box-page">
      <section className="bg-nigeria-dark text-white relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 ankara-pattern opacity-10" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-nigeria-lime blur-[80px] opacity-40" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-nigeria-orange blur-[80px] opacity-30" />
        <div className="brianna-container relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
            <Package className="w-3.5 h-3.5 text-nigeria-lime" />
            <span className="text-xs font-black tracking-widest uppercase text-nigeria-lime">Subscription Box</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.95]">The Brianna Box.<br /><span className="text-nigeria-lime">Monthly magic.</span></h1>
          <p className="mt-6 text-lg text-white/80">Hand-curated Nigerian essentials delivered to your door every month. Skip or cancel anytime. Free shipping everywhere.</p>

          <div className="mt-10 inline-flex p-1.5 bg-white/10 rounded-full backdrop-blur-sm" data-testid="mode-toggle">
            <button onClick={() => setMode("tiers")} className={`px-6 py-2.5 rounded-full text-sm font-black transition ${mode === "tiers" ? "bg-nigeria-lime text-nigeria-dark" : "text-white"}`} data-testid="mode-tiers">Curated Tiers</button>
            <button onClick={() => setMode("custom")} className={`px-6 py-2.5 rounded-full text-sm font-black transition ${mode === "custom" ? "bg-nigeria-lime text-nigeria-dark" : "text-white"}`} data-testid="mode-custom">Build Your Own</button>
          </div>
        </div>
      </section>

      {mode === "tiers" ? (
        <section className="brianna-container py-16 md:py-24" data-testid="tiers-section">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col ${t.popular ? "border-nigeria-orange shadow-2xl md:-translate-y-4" : "border-black/5"}`}
                data-testid={`tier-${t.id}`}
              >
                {t.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-nigeria-orange text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Most Popular</div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${t.color === "primary" ? "bg-nigeria-lime" : t.color === "secondary" ? "bg-nigeria-orange text-white" : "bg-nigeria-dark text-white"}`}>
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="mt-5 font-display font-black text-3xl text-nigeria-dark">{t.name}</h3>
                <p className="text-sm font-bold text-nigeria-orange mt-1">{t.tagline}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display font-black text-5xl text-nigeria-dark">${t.price.toFixed(0)}</span>
                  <span className="text-sm font-bold text-muted-foreground">/month</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{t.items_count} curated items • Serves {t.serves}</div>
                <ul className="mt-6 space-y-3 flex-1">
                  {t.benefits.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-nigeria-lime flex-shrink-0 mt-0.5" /> <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => subscribe(t.id)}
                  disabled={loading === t.id}
                  className={`mt-8 rounded-full h-12 font-black ${t.popular ? "bg-nigeria-orange hover:bg-[#E64A00] text-white" : "bg-nigeria-dark hover:bg-nigeria-orange text-white"}`}
                  data-testid={`subscribe-${t.id}`}
                >
                  {loading === t.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</> : <>Subscribe now <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <section className="brianna-container py-16 md:py-24" data-testid="custom-builder-section">
          <div className="max-w-2xl mb-10">
            <div className="label-eyebrow text-nigeria-orange mb-3">Build your own</div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-nigeria-dark tracking-tight">Pick your favourites.<br />We ship them monthly.</h2>
            <p className="mt-4 text-muted-foreground">Browse the market, add items to your basket, and we'll repeat your order every month. Change it up anytime.</p>
          </div>
          <CustomBuilder products={products} />
        </section>
      )}

      <section className="brianna-section bg-nigeria-cream relative overflow-hidden">
        <div className="absolute inset-0 ankara-pattern opacity-50" />
        <div className="brianna-container relative">
          <h2 className="font-display font-black text-4xl md:text-5xl text-nigeria-dark tracking-tight mb-10">How it works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Pick your box", d: "Choose a curated tier or build your own." },
              { n: "02", t: "We curate", d: "Fresh seasonal items handpicked by Nigerian chefs." },
              { n: "03", t: "We ship", d: "Vacuum-sealed, tracked, and delivered worldwide." },
              { n: "04", t: "You cook", d: "Recipes and AI chef Brianna included in every box." },
            ].map((s, i) => (
              <div key={s.n} className="relative bg-white rounded-3xl p-6 border border-black/5">
                <div className="font-display font-black text-6xl text-nigeria-lime leading-none">{s.n}</div>
                <h3 className="font-display font-black text-xl text-nigeria-dark mt-3">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CustomBuilder({ products }) {
  const { add, items, count } = useCart();
  return (
    <div>
      <div className="mb-6 inline-flex items-center gap-3 bg-nigeria-dark text-white rounded-full px-5 py-3" data-testid="builder-counter">
        <Sparkles className="w-4 h-4 text-nigeria-lime" />
        <span className="text-sm font-black">{count} item{count === 1 ? "" : "s"} added — add more below</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
      {count > 0 && (
        <div className="mt-10 text-center">
          <Button onClick={() => (window.location.href = "/checkout")} className="btn-primary h-14" data-testid="builder-checkout">
            Checkout your custom box <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
