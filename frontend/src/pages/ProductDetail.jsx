import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Minus, Plus, ShoppingBag, Heart, Truck, Shield, RefreshCw, ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="brianna-container py-20" data-testid="product-loading">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square rounded-3xl bg-muted" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded" />
            <div className="h-6 w-1/2 bg-muted rounded" />
            <div className="h-20 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="brianna-container py-20 text-center" data-testid="product-not-found">Product not found.</div>;

  return (
    <div className="brianna-container py-8 md:py-14" data-testid="product-detail-page">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-bold text-nigeria-dark hover:text-nigeria-orange mb-6" data-testid="back-to-shop">
        <ChevronLeft className="w-4 h-4" /> Back to shop
      </Link>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-nigeria-cream relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" data-testid="product-image" />
            {product.featured && (
              <span className="absolute top-4 left-4 chip bg-nigeria-orange text-white">Bestseller</span>
            )}
          </div>
        </motion.div>

        <div>
          <div className="label-eyebrow text-nigeria-orange mb-2">{product.category}</div>
          <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-nigeria-dark tracking-tight leading-[1]" data-testid="product-name">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-nigeria-amber text-nigeria-amber" : "text-muted-foreground"}`} />
              ))}
            </div>
            <span className="text-sm font-bold">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews_count} reviews)</span>
          </div>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground" data-testid="product-description">{product.description}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display font-black text-5xl text-nigeria-dark" data-testid="product-price">${product.price.toFixed(2)}</span>
            {product.weight && <span className="text-sm font-bold text-muted-foreground">/ {product.weight}</span>}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center bg-white border-2 border-nigeria-dark rounded-full overflow-hidden" data-testid="qty-selector">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-nigeria-lime" data-testid="qty-minus"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center font-black text-lg" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-nigeria-lime" data-testid="qty-plus"><Plus className="w-4 h-4" /></button>
            </div>
            <Button onClick={() => add(product, qty)} className="btn-primary h-12" data-testid="add-to-cart-btn">
              <ShoppingBag className="w-4 h-4" /> Add to basket
            </Button>
            <button className="w-12 h-12 rounded-full border-2 border-nigeria-dark flex items-center justify-center hover:bg-nigeria-orange hover:border-nigeria-orange hover:text-white transition" data-testid="wishlist-btn">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[{ icon: Truck, l: "Free over $79" }, { icon: Shield, l: "Quality sealed" }, { icon: RefreshCw, l: "Easy returns" }].map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-nigeria-cream rounded-2xl px-3 py-3">
                <f.icon className="w-5 h-5 text-nigeria-dark" />
                <span className="text-xs font-bold">{f.l}</span>
              </div>
            ))}
          </div>

          <Tabs defaultValue="details" className="mt-10">
            <TabsList className="grid grid-cols-3 rounded-full bg-nigeria-cream p-1" data-testid="tabs-list">
              <TabsTrigger value="details" className="rounded-full data-[state=active]:bg-nigeria-dark data-[state=active]:text-white" data-testid="tab-details">Details</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-nigeria-dark data-[state=active]:text-white" data-testid="tab-reviews">Reviews ({product.reviews_count})</TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-full data-[state=active]:bg-nigeria-dark data-[state=active]:text-white" data-testid="tab-shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4 text-sm text-muted-foreground leading-relaxed">
              <ul className="space-y-2">
                <li><b className="text-nigeria-dark">Origin:</b> {product.origin || "Nigeria"}</li>
                <li><b className="text-nigeria-dark">Weight:</b> {product.weight}</li>
                <li><b className="text-nigeria-dark">Category:</b> {product.category}</li>
                {product.subcategory && <li><b className="text-nigeria-dark">Sub:</b> {product.subcategory}</li>}
                <li><b className="text-nigeria-dark">Storage:</b> Store in a cool, dry place. Refer to product label.</li>
              </ul>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 space-y-4">
              {product.reviews?.length ? (
                product.reviews.map((r) => (
                  <div key={r.id} className="bg-nigeria-cream rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-nigeria-dark">{r.user_name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (<Star key={i} className="w-3 h-3 fill-nigeria-amber text-nigeria-amber" />))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your Naija kitchen experience!</p>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="mt-4 text-sm text-muted-foreground">
              <p>We ship worldwide in 3-5 business days (express) or 5-10 days (standard). Free shipping on orders over $79. Orders are vacuum-sealed and temperature-controlled when needed.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {product.related?.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display font-black text-3xl md:text-4xl text-nigeria-dark tracking-tight mb-8">You might also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {product.related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
