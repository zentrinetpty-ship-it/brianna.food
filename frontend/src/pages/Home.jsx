import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { api } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { ArrowRight, Sparkles, Truck, Star, Package, Leaf, Shield, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { name: "Soup Ingredients", icon: "🍲", color: "bg-nigeria-lime", image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=800&q=80" },
  { name: "Proteins", icon: "🐟", color: "bg-nigeria-orange", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80" },
  { name: "Grains & Flours", icon: "🌾", color: "bg-nigeria-amber", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80" },
  { name: "Spices & Seasoning", icon: "🌶️", color: "bg-nigeria-lime", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80" },
  { name: "Snacks", icon: "🥐", color: "bg-nigeria-orange", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80" },
  { name: "Beverages", icon: "🥤", color: "bg-nigeria-amber", image: "https://images.unsplash.com/photo-1624806992066-5b46eec2bc4d?auto=format&fit=crop&w=800&q=80" },
  { name: "Fresh Produce", icon: "🥬", color: "bg-nigeria-lime", image: "https://images.unsplash.com/photo-1552709607-08d00227833d?auto=format&fit=crop&w=800&q=80" },
  { name: "Beauty & Personal Care", icon: "🧴", color: "bg-nigeria-orange", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=80" },
];

const TESTIMONIALS = [
  { name: "Chinyere A.", location: "London, UK", rating: 5, text: "I cried when the stockfish arrived. That Sunday afiafia soup tasted exactly like Mama's. Brianna, you're a lifesaver!" },
  { name: "Tunde O.", location: "Houston, TX", rating: 5, text: "The monthly box is chef's kiss. My kids now think garri is called 'Brianna cereal'. 10/10 will reorder." },
  { name: "Adaeze N.", location: "Toronto, CA", rating: 5, text: "Finally found real oha leaves that don't taste like cardboard. My ofe oha is back on the menu." },
  { name: "Seun B.", location: "Berlin, DE", rating: 5, text: "Jollof night is officially legendary again. Ofada rice + ayamase was *elite*." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, a] = await Promise.all([
          api.get("/products", { params: { featured: true, limit: 8 } }),
          api.get("/products", { params: { limit: 8, sort: "new" } }),
        ]);
        setFeatured(f.data);
        setAll(a.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden bg-nigeria-cream pt-10 md:pt-16 pb-20 md:pb-28" data-testid="hero-section">
        <div className="absolute inset-0 ankara-pattern opacity-60 pointer-events-none" />
        <div className="brianna-container relative grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 shadow-sm mb-6" data-testid="hero-badge">
              <span className="w-2 h-2 rounded-full bg-nigeria-lime animate-pulse" />
              <span className="text-xs font-black tracking-widest text-nigeria-dark uppercase">Now delivering to 40+ countries</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-black tracking-[-0.04em] text-nigeria-dark text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95]"
            >
              Naija kitchen,<br />
              <span className="relative inline-block">
                <span className="text-nigeria-orange">shipped worldwide.</span>
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 9 Q 75 2, 150 6 T 298 5" stroke="#95D600" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Fresh <b className="text-nigeria-dark">egusi</b>, premium <b className="text-nigeria-dark">stockfish</b>, aromatic <b className="text-nigeria-dark">oha leaves</b>, scotch bonnets and 500+ authentic Nigerian essentials — delivered to your door in 3-5 days. Taste home, anywhere.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="mt-10 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary" data-testid="hero-shop-btn">
                Shop the market <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/monthly-box" className="btn-outline-dark" data-testid="hero-box-btn">
                Explore Monthly Box
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }} className="mt-10 flex items-center gap-6 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-white ${i % 2 ? "bg-nigeria-lime" : "bg-nigeria-orange"}`} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="w-4 h-4 fill-nigeria-amber text-nigeria-amber" />))}
                  <span className="ml-2 font-black text-nigeria-dark">4.9/5</span>
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">From 12,000+ happy diasporans</div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-5 relative z-10">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-nigeria-lime blur-3xl opacity-40" />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-nigeria-orange blur-3xl opacity-30" />
              <motion.div animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 8, repeat: Infinity }} className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/50949266-3fc6-4e36-a0b9-e75b1e1a578a/images/59bb0bd914161174f67575629cea61a93a3c6066edee58574616f9b331e0f27a.png"
                  alt="Brianna Premium Monthly Box"
                  className="w-full h-auto object-cover"
                  data-testid="hero-image"
                />
              </motion.div>
              {/* Floating cards */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-4 top-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-black/5">
                <div className="w-10 h-10 rounded-full bg-nigeria-lime flex items-center justify-center"><Leaf className="w-5 h-5 text-nigeria-dark" /></div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fresh</div>
                  <div className="font-bold text-sm text-nigeria-dark">From Lagos</div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} className="absolute -right-4 bottom-10 bg-nigeria-dark text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nigeria-orange flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-nigeria-lime">Ships in</div>
                  <div className="font-bold text-sm">3-5 days</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <section className="border-y-2 border-nigeria-dark bg-nigeria-cream py-6 md:py-8 overflow-hidden" data-testid="ticker">
        <Marquee speed={60} gradient={false} pauseOnHover>
          {["EGUSI", "STOCKFISH", "OHA LEAF", "JOLLOF RICE", "GARRI", "PLANTAIN", "SUYA", "SCOTCH BONNETS", "PUFF PUFF", "ZOBO", "SHEA BUTTER", "OFADA"].map((w, i) => (
            <span key={i} className="mx-8 md:mx-12 font-display font-black text-4xl md:text-6xl outlined-text inline-flex items-center">
              {w} <span className="mx-6 text-nigeria-orange">✦</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* CATEGORIES BENTO */}
      <section className="brianna-section brianna-container" data-testid="categories-section">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="label-eyebrow text-nigeria-orange mb-3">Shop by Category</div>
            <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-nigeria-dark tracking-tight">Everything you miss<br />from home.</h2>
          </div>
          <Link to="/shop" className="btn-outline-dark self-start" data-testid="view-all-categories">
            See all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform duration-500"
                data-testid={`category-${c.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
              >
                <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-nigeria-dark via-nigeria-dark/40 to-transparent" />
                <div className={`absolute top-4 left-4 w-12 h-12 rounded-full ${c.color} flex items-center justify-center text-2xl shadow-lg`}>{c.icon}</div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display font-black text-xl text-white leading-tight">{c.name}</h3>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-nigeria-lime font-bold">
                    Shop now <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="brianna-section brianna-container" data-testid="featured-section">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="label-eyebrow text-nigeria-orange mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Bestsellers</div>
            <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-nigeria-dark tracking-tight">Crowd favourites<br />& diaspora staples.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* MONTHLY BOX CTA */}
      <section className="brianna-section" data-testid="box-cta-section">
        <div className="brianna-container">
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-nigeria-dark text-white p-8 md:p-14 lg:p-20 noise-overlay">
            <div className="absolute inset-0 ankara-pattern opacity-10" />
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-nigeria-lime blur-[80px] opacity-30" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-nigeria-orange blur-[80px] opacity-30" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
                  <Package className="w-3.5 h-3.5 text-nigeria-lime" />
                  <span className="text-xs font-black tracking-widest uppercase text-nigeria-lime">Subscription Box</span>
                </div>
                <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight">The Brianna Box,<br />delivered monthly.</h2>
                <p className="mt-6 text-white/80 text-lg max-w-xl">Hand-curated Naija essentials rotated every month. From the Starter for solo diasporans to the Premium box for the whole family. Cancel anytime. Free shipping. Zero stress.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/monthly-box" className="btn-lime" data-testid="box-cta-primary">
                    Build your box <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                  {[{ n: "20+", l: "Items/box" }, { n: "40+", l: "Countries" }, { n: "< 5d", l: "Shipping" }].map((s) => (
                    <div key={s.l}>
                      <div className="font-display font-black text-3xl text-nigeria-lime">{s.n}</div>
                      <div className="text-xs text-white/60 uppercase tracking-wider">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <motion.div animate={{ rotate: [0, -3, 3, 0] }} transition={{ duration: 10, repeat: Infinity }} className="rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl">
                  <img src="https://static.prod-images.emergentagent.com/jobs/50949266-3fc6-4e36-a0b9-e75b1e1a578a/images/59bb0bd914161174f67575629cea61a93a3c6066edee58574616f9b331e0f27a.png" alt="Brianna Box" className="w-full h-auto" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="brianna-section brianna-container" data-testid="why-us">
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: Leaf, title: "Hand-picked fresh", text: "Sourced from trusted Naija markets. Fresh, authentic, never compromised." },
            { icon: Shield, title: "Quality guaranteed", text: "Vacuum-sealed, temperature-controlled, and protected in transit." },
            { icon: Truck, title: "Worldwide delivery", text: "Express shipping to 40+ countries. Track every step of the way." },
            { icon: Clock, title: "Always in stock", text: "Stay supplied with our Monthly Box — never run out of the essentials." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-3xl p-6 border border-black/5 hover:border-nigeria-lime hover:-translate-y-1 transition-all"
              data-testid={`feature-${f.title.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-nigeria-lime/20 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-nigeria-dark" />
              </div>
              <h3 className="font-display font-black text-lg text-nigeria-dark">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LATEST */}
      <section className="brianna-section brianna-container" data-testid="latest-section">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="label-eyebrow text-nigeria-orange mb-3">New in the market</div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-nigeria-dark tracking-tight">Fresh arrivals</h2>
          </div>
          <Link to="/shop?sort=new" className="btn-outline-dark self-start" data-testid="view-new-arrivals">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : all.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="brianna-section bg-nigeria-cream relative overflow-hidden" data-testid="testimonials-section">
        <div className="absolute inset-0 ankara-pattern opacity-50" />
        <div className="brianna-container relative">
          <div className="label-eyebrow text-nigeria-orange mb-3">Diaspora love</div>
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-nigeria-dark tracking-tight">Kind words from our<br />extended family.</h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm hover:shadow-xl transition"
                data-testid={`testimonial-${i}`}
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, s) => (<Star key={s} className="w-4 h-4 fill-nigeria-amber text-nigeria-amber" />))}
                </div>
                <p className="text-sm leading-relaxed text-nigeria-dark">{t.text}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-nigeria-lime flex items-center justify-center font-black text-nigeria-dark">{t.name[0]}</div>
                  <div>
                    <div className="font-bold text-sm text-nigeria-dark">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="brianna-section brianna-container" data-testid="newsletter-section">
        <div className="bg-nigeria-lime rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 lg:p-20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 text-[20rem] font-display font-black text-nigeria-dark/5 leading-none select-none">B</div>
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="label-eyebrow mb-3">Stay delicious</div>
              <h2 className="font-display font-black text-3xl md:text-5xl text-nigeria-dark tracking-tight">Get 10% off your first order + weekly recipes.</h2>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
              <input placeholder="you@example.com" className="flex-1 h-14 px-6 rounded-full bg-white border-2 border-transparent focus:border-nigeria-dark focus:outline-none font-medium" data-testid="newsletter-email" />
              <button type="submit" className="btn-primary h-14" data-testid="newsletter-submit">
                Subscribe <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
