import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, Users, Package, ShoppingBag, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const [s, p, o] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/products", { params: { limit: 60 } }),
        api.get("/admin/orders"),
      ]);
      setStats(s.data);
      setProducts(p.data);
      setOrders(o.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  const statCards = [
    { label: "Users", value: stats?.users || 0, icon: Users, color: "bg-nigeria-lime" },
    { label: "Products", value: stats?.products || 0, icon: Package, color: "bg-nigeria-orange" },
    { label: "Orders", value: stats?.orders || 0, icon: ShoppingBag, color: "bg-nigeria-amber" },
    { label: "Revenue", value: `$${(stats?.revenue || 0).toFixed(0)}`, icon: DollarSign, color: "bg-nigeria-dark" },
  ];

  return (
    <div className="brianna-container py-10 md:py-14" data-testid="admin-page">
      <div className="label-eyebrow text-nigeria-orange mb-3">Admin</div>
      <h1 className="font-display font-black text-4xl md:text-5xl text-nigeria-dark tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-3xl p-6 border border-black/5" data-testid={`stat-${s.label.toLowerCase()}`}>
            <div className={`w-10 h-10 rounded-xl ${s.color} ${s.color === "bg-nigeria-dark" ? "text-white" : "text-nigeria-dark"} flex items-center justify-center`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="font-display font-black text-3xl text-nigeria-dark mt-3">{s.value}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-black/5 p-6">
          <h2 className="font-display font-black text-2xl text-nigeria-dark mb-4">Products</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-nigeria-cream" data-testid={`admin-product-${p.id}`}>
                <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm line-clamp-1">{p.name}</div>
                  <div className="text-xs text-muted-foreground">${p.price.toFixed(2)} • {p.category}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => del(p.id)} className="text-destructive" data-testid={`delete-${p.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-black/5 p-6">
          <h2 className="font-display font-black text-2xl text-nigeria-dark mb-4">Recent Orders</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {orders.slice(0, 20).map((o) => (
              <div key={o.id} className="p-3 rounded-xl bg-nigeria-cream" data-testid={`admin-order-${o.id}`}>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono">#{o.id.slice(0, 8)}</code>
                  <span className={`chip ${o.status === "paid" ? "bg-nigeria-lime text-nigeria-dark" : "bg-nigeria-amber/30"}`}>{o.status}</span>
                </div>
                <div className="mt-1 text-sm font-bold">${o.total.toFixed(2)} • {o.user_email || "guest"}</div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
