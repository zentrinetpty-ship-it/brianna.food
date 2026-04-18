import { Link } from "react-router-dom";
import { useState } from "react";
import { Star, Heart, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export function ProductCard({ product, index = 0 }) {
  const { add } = useCart();
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
      className="card-product group flex flex-col"
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-square bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";
          }}
        />
        {product.featured && (
          <span className="absolute top-3 left-3 chip bg-nigeria-orange text-white shadow" data-testid="featured-badge">
            Bestseller
          </span>
        )}
        <button
          onClick={() => setLiked((v) => !v)}
          }}
          className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center backdrop-blur-md transition ${liked ? "bg-nigeria-orange text-white" : "bg-white/85 text-nigeria-dark hover:bg-white"}`}
          style={{ borderRadius: "4px" }}
          aria-label="Save to wishlist"
          data-testid={`wishlist-toggle-${product.slug}`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
        </button>
      </Link>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-nigeria-amber text-nigeria-amber" />
          <span className="text-xs font-bold text-nigeria-dark">{product.rating || 4.8}</span>
          <span className="text-xs text-muted-foreground">({product.reviews_count || 0})</span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.weight}</span>
        </div>
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-heading font-bold text-nigeria-dark text-base leading-tight line-clamp-2 hover:text-nigeria-orange transition">{product.name}</h3>
        </Link>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">From</div>
            <div className="font-display font-black text-xl text-nigeria-dark">${product.price.toFixed(2)}</div>
          </div>
          <button
            onClick={() => add(product, 1)}
            className="w-11 h-11 rounded-full bg-nigeria-dark hover:bg-nigeria-orange text-white flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(255,85,0,0.35)]"
            aria-label="Add to cart"
            data-testid={`add-to-cart-${product.slug}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-product group flex flex-col animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-5 w-full bg-muted rounded" />
        <div className="h-4 w-1/3 bg-muted rounded" />
      </div>
    </div>
  );
}
