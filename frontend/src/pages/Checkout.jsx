import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Loader2, Tag, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

const COUNTRIES = [
  { code: "US", name: "🇺🇸 United States" },
  { code: "UK", name: "🇬🇧 United Kingdom" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "DE", name: "🇩🇪 Germany" },
  { code: "FR", name: "🇫🇷 France" },
  { code: "NL", name: "🇳🇱 Netherlands" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "NG", name: "🇳🇬 Nigeria" },
  { code: "OTHER", name: "🌍 Other country" },
];

export default function Checkout() {
  const { items, subtotal, count, clear } = useCart();
  const navigate = useNavigate();
  const [country, setCountry] = useState("US");
  const [method, setMethod] = useState("standard");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  const rates = { US: { standard: 19.99, express: 39.99 }, UK: { standard: 22.99, express: 44.99 }, CA: { standard: 21.99, express: 42.99 }, DE: { standard: 24.99, express: 49.99 }, AU: { standard: 29.99, express: 59.99 }, FR: { standard: 24.99, express: 49.99 }, NL: { standard: 24.99, express: 49.99 }, NG: { standard: 9.99, express: 19.99 }, OTHER: { standard: 34.99, express: 69.99 } };
  const shipping = subtotal >= 79 ? 0 : rates[country][method];
  const discount = coupon.toUpperCase() === "NAIJA10" ? subtotal * 0.10 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const submit = async () => {
    if (!items.length) return;
    try {
      setLoading(true);
      const { data } = await api.post("/checkout/cart", {
        origin_url: window.location.origin,
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        shipping_country: country,
        shipping_method: method,
        coupon: coupon || null,
      });
      window.location.href = data.url;
    } catch (e) {
      toast.error("Could not start checkout. Try again.");
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="brianna-container py-24 text-center" data-testid="empty-checkout">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="font-display font-black text-4xl text-nigeria-dark">Your basket is empty</h1>
        <p className="text-muted-foreground mt-2">Add some Naija staples first.</p>
        <Button onClick={() => navigate("/shop")} className="mt-6 btn-primary" data-testid="empty-go-shop">Go to shop</Button>
      </div>
    );
  }

  return (
    <div className="brianna-container py-10 md:py-14" data-testid="checkout-page">
      <h1 className="font-display font-black text-4xl md:text-5xl text-nigeria-dark tracking-tight">Checkout</h1>
      <p className="text-muted-foreground mt-2">Almost there. Delicious home, minutes away.</p>

      <div className="mt-10 grid lg:grid-cols-[1fr,400px] gap-10">
        <div className="space-y-8">
          <section className="bg-white rounded-3xl border border-black/5 p-6 md:p-8">
            <h2 className="font-display font-black text-2xl text-nigeria-dark mb-5">Shipping destination</h2>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest mb-2 block">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-12 rounded-xl" data-testid="country-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6">
              <Label className="text-xs font-black uppercase tracking-widest mb-2 block">Delivery speed</Label>
              <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-3" data-testid="shipping-radio">
                {["standard", "express"].map((m) => (
                  <label key={m} className={`relative cursor-pointer rounded-2xl border-2 p-4 ${method === m ? "border-nigeria-orange bg-nigeria-orange/5" : "border-black/5"}`}>
                    <RadioGroupItem value={m} className="absolute right-3 top-3" data-testid={`shipping-${m}`} />
                    <Truck className="w-5 h-5 text-nigeria-dark" />
                    <div className="mt-2 font-black capitalize">{m}</div>
                    <div className="text-xs text-muted-foreground">{m === "standard" ? "5-10 days" : "3-5 days"}</div>
                    <div className="font-bold text-nigeria-dark mt-1">${rates[country][m].toFixed(2)}</div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-black/5 p-6 md:p-8">
            <h2 className="font-display font-black text-2xl text-nigeria-dark mb-5">Your order</h2>
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-4" data-testid={`co-item-${it.id}`}>
                  <img src={it.image} alt={it.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm line-clamp-1">{it.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {it.qty}</div>
                  </div>
                  <div className="font-bold">${(it.price * it.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="bg-nigeria-dark text-white rounded-3xl p-6 md:p-8 h-fit sticky top-24 space-y-4 relative overflow-hidden" data-testid="checkout-summary">
          <div className="absolute inset-0 ankara-pattern opacity-10" />
          <div className="relative">
            <h2 className="font-display font-black text-2xl">Order summary</h2>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/70">Items ({count})</span><span className="font-bold" data-testid="sum-subtotal">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-white/70">Shipping</span><span className="font-bold" data-testid="sum-shipping">{shipping === 0 ? <span className="text-nigeria-lime">FREE</span> : `$${shipping.toFixed(2)}`}</span></div>
              {discount > 0 && <div className="flex justify-between text-nigeria-lime"><span>Discount (NAIJA10)</span><span className="font-bold">-${discount.toFixed(2)}</span></div>}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-baseline">
              <span className="text-white/70 text-sm">Total</span>
              <span className="font-display font-black text-4xl text-nigeria-lime" data-testid="sum-total">${total.toFixed(2)}</span>
            </div>

            <div className="mt-5">
              <Label className="text-xs font-black uppercase tracking-widest mb-2 block text-nigeria-lime">Promo code</Label>
              <div className="flex gap-2">
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="NAIJA10" className="bg-white/10 border-white/20 text-white h-11 rounded-full placeholder:text-white/40" data-testid="coupon-input" />
                <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 rounded-full h-11 w-11" data-testid="coupon-btn"><Tag className="w-4 h-4" /></Button>
              </div>
              {coupon && discount === 0 && <p className="text-xs text-white/50 mt-1">Try NAIJA10 for 10% off</p>}
            </div>

            <Button onClick={submit} disabled={loading} className="w-full mt-6 h-14 rounded-full bg-nigeria-orange hover:bg-[#E64A00] font-black text-white text-base" data-testid="pay-btn">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</> : <><Lock className="w-4 h-4" /> Pay ${total.toFixed(2)}</>}
            </Button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/60">
              <ShieldCheck className="w-4 h-4 text-nigeria-lime" /> Secure checkout powered by Stripe
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
