import { motion } from "framer-motion";
import { Heart, Globe, Leaf, Truck, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="bg-nigeria-cream py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 ankara-pattern opacity-50" />
        <div className="brianna-container relative grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="label-eyebrow text-nigeria-orange mb-3">Our story</div>
            <h1 className="font-display font-black text-5xl md:text-7xl text-nigeria-dark tracking-tighter leading-[0.95]">Homesick no more.</h1>
            <p className="mt-6 text-lg text-muted-foreground">Brianna.app was born in a small London kitchen. A craving for real egusi. A FaceTime call with Grandma in Enugu. A promise that every Nigerian in the diaspora deserves the real taste of home — not a poor imitation.</p>
            <p className="mt-4 text-muted-foreground">Today, we ship to 40+ countries, hand-picked from trusted Naija markets, quality-checked by chefs, delivered to your door.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary" data-testid="about-shop-btn">Shop the market <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/monthly-box" className="btn-outline-dark" data-testid="about-box-btn">Try the Monthly Box</Link>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative">
            <div className="rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl">
              <img src="https://images.unsplash.com/photo-1765584829997-12ab011bb5b3?auto=format&fit=crop&w=1200&q=80" alt="Nigerian market" className="w-full h-auto" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="brianna-container py-16">
        <h2 className="font-display font-black text-4xl md:text-5xl text-nigeria-dark tracking-tight text-center">Why diasporans love us</h2>
        <div className="mt-12 grid md:grid-cols-4 gap-5">
          {[
            { icon: Heart, t: "Authentic", d: "Real Naija staples, from real Naija markets." },
            { icon: Globe, t: "Worldwide", d: "We ship to 40+ countries, always tracked." },
            { icon: Leaf, t: "Fresh", d: "Farm-to-box, with careful temperature control." },
            { icon: Award, t: "Trusted", d: "12,000+ happy customers. 4.9/5 star rating." },
          ].map((f, i) => (
            <motion.div key={f.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-3xl p-6 border border-black/5 hover:border-nigeria-lime hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-nigeria-lime/20 flex items-center justify-center"><f.icon className="w-6 h-6 text-nigeria-dark" /></div>
              <h3 className="font-display font-black text-xl text-nigeria-dark mt-4">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="brianna-container pb-16">
        <div className="bg-nigeria-dark text-white rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 ankara-pattern opacity-10" />
          <div className="relative text-center max-w-2xl mx-auto">
            <Truck className="w-10 h-10 text-nigeria-lime mx-auto mb-4" />
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight">Ready to taste home?</h2>
            <p className="mt-4 text-white/80">Fresh ingredients. Fair prices. Real flavour. Start your Naija kitchen journey today.</p>
            <Link to="/shop" className="mt-8 inline-flex btn-lime" data-testid="about-cta">Shop now <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
