import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Heart, User, MapPin, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

export default function Account() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "orders";
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [subs, setSubs] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [o, s, w] = await Promise.all([
          api.get("/orders"),
          api.get("/subscriptions"),
          api.get("/wishlist"),
        ]);
        setOrders(o.data);
        setSubs(s.data);
        setWishlist(w.data);
      } catch {}
    })();
  }, []);

  if (!user || user === false) return null;

  return (
    <div className="brianna-container py-10 md:py-14" data-testid="account-page">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full bg-nigeria-lime flex items-center justify-center font-display font-black text-3xl text-nigeria-dark shadow-lg">
          {user.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="label-eyebrow text-nigeria-orange">My account</div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-nigeria-dark">Hey, {user.name}</h1>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
        <TabsList className="inline-flex bg-nigeria-cream rounded-full p-1" data-testid="account-tabs">
          <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-nigeria-dark data-[state=active]:text-white" data-testid="tab-orders"><Package className="w-4 h-4 mr-1.5" /> Orders</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-full data-[state=active]:bg-nigeria-dark data-[state=active]:text-white" data-testid="tab-subs"><Sparkles className="w-4 h-4 mr-1.5" /> Subscriptions</TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-full data-[state=active]:bg-nigeria-dark data-[state=active]:text-white" data-testid="tab-wl"><Heart className="w-4 h-4 mr-1.5" /> Wishlist</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-nigeria-dark data-[state=active]:text-white" data-testid="tab-profile"><User className="w-4 h-4 mr-1.5" /> Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {orders.length === 0 ? (
            <EmptyState icon={Package} title="No orders yet" text="Your first Naija box is waiting!" />
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col md:flex-row md:items-center gap-4" data-testid={`order-${o.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Order</span>
                      <code className="font-mono">#{o.id.slice(0, 8)}</code>
                      <span>•</span>
                      <span>{new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 font-bold text-nigeria-dark">{o.items.length} items • Ship to {o.shipping_country}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-black text-2xl text-nigeria-dark">${o.total.toFixed(2)}</div>
                    <div className={`chip ${o.status === "paid" ? "bg-nigeria-lime/20 text-nigeria-dark" : "bg-nigeria-amber/20 text-nigeria-dark"} mt-1 capitalize`}>{o.status.replace("_", " ")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          {subs.length === 0 ? (
            <EmptyState icon={Sparkles} title="No active subscriptions" text="Explore our Monthly Box options." />
          ) : (
            <div className="space-y-4">
              {subs.map((s) => (
                <div key={s.id} className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col md:flex-row md:items-center gap-4" data-testid={`sub-${s.id}`}>
                  <div className="flex-1">
                    <div className="font-display font-black text-2xl text-nigeria-dark">{s.tier_name}</div>
                    <div className="text-sm text-muted-foreground">${s.price.toFixed(2)}/month • Next delivery: {s.next_delivery ? new Date(s.next_delivery).toLocaleDateString() : "—"}</div>
                  </div>
                  <div className={`chip ${s.status === "active" ? "bg-nigeria-lime text-nigeria-dark" : "bg-nigeria-amber/30 text-nigeria-dark"} capitalize`}>{s.status.replace("_", " ")}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          {wishlist.length === 0 ? (
            <EmptyState icon={Heart} title="Wishlist empty" text="Save your favourites for later." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {wishlist.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="bg-white rounded-3xl border border-black/5 p-8 max-w-xl">
            <h3 className="font-display font-black text-2xl text-nigeria-dark">Profile</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex gap-4"><span className="w-24 text-muted-foreground">Name</span><span className="font-bold">{user.name}</span></div>
              <div className="flex gap-4"><span className="w-24 text-muted-foreground">Email</span><span className="font-bold">{user.email}</span></div>
              <div className="flex gap-4"><span className="w-24 text-muted-foreground">Role</span><span className="font-bold capitalize">{user.role}</span></div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="text-center py-16 bg-nigeria-cream rounded-3xl">
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto shadow">
        <Icon className="w-7 h-7 text-nigeria-dark" />
      </div>
      <h3 className="font-display font-black text-2xl text-nigeria-dark mt-4">{title}</h3>
      <p className="text-muted-foreground mt-1">{text}</p>
    </div>
  );
}
