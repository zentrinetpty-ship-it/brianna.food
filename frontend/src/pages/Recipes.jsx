import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Clock, Users, ArrowRight, Sparkles } from "lucide-react";

const RECIPES = [
  { name: "Classic Jollof Rice", time: "45 min", serves: "6", tag: "Iconic", image: "https://images.unsplash.com/photo-1610663711502-35f870cfaea2?auto=format&fit=crop&w=1200&q=80", desc: "The smoky, fiery, party-king of Nigerian rice dishes." },
  { name: "Egusi Soup with Pounded Yam", time: "1 hr 15 min", serves: "5", tag: "Soul food", image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=1200&q=80", desc: "Creamy, nutty, and unapologetically rich. Sunday dinner sorted." },
  { name: "Suya Skewers", time: "30 min", serves: "4", tag: "Street", image: "https://images.unsplash.com/photo-1599909366516-6c1d4c1f8a35?auto=format&fit=crop&w=1200&q=80", desc: "Smoky yaji-dusted beef — straight off the Kano griddle." },
  { name: "Oha Soup", time: "1 hr", serves: "4", tag: "Igbo classic", image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1200&q=80", desc: "Fragrant oha leaves with cocoyam paste and smoked fish." },
  { name: "Moi Moi", time: "1 hr 30 min", serves: "6", tag: "Steamed", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=1200&q=80", desc: "Silky steamed bean pudding with pepper, egg and fish." },
  { name: "Pepper Soup (Catfish)", time: "40 min", serves: "4", tag: "Soul food", image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1200&q=80", desc: "Fiery, aromatic, perfect for rainy evenings." },
];

export default function Recipes() {
  return (
    <div data-testid="recipes-page">
      <section className="bg-nigeria-cream py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 ankara-pattern opacity-50" />
        <div className="brianna-container relative max-w-3xl">
          <div className="label-eyebrow text-nigeria-orange mb-3">Recipes</div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-nigeria-dark tracking-tighter leading-[0.95]">Cook like Mama<br />did it.</h1>
          <p className="mt-6 text-lg text-muted-foreground">Step-by-step Naija classics, tested by chefs, loved by the diaspora. Every ingredient is one click away in our shop.</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-black/5 shadow-sm">
            <Sparkles className="w-4 h-4 text-nigeria-orange" />
            <span className="text-sm font-bold">Powered by AI chef Brianna — ask her anything!</span>
          </div>
        </div>
      </section>

      <section className="brianna-container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECIPES.map((r, i) => (
            <motion.article
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white rounded-3xl overflow-hidden border border-black/5 hover:border-nigeria-lime hover:-translate-y-1 transition-all"
              data-testid={`recipe-${r.name.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-3 left-3 chip bg-nigeria-orange text-white">{r.tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-black text-2xl text-nigeria-dark">{r.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {r.time}</span>
                  <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Serves {r.serves}</span>
                </div>
                <Link to="/shop" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-nigeria-orange hover:underline" data-testid={`shop-ingredients-${r.name.toLowerCase().replace(/\s/g, "-")}`}>
                  Shop ingredients <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
