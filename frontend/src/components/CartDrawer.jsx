import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export function CartDrawer() {
  const { open, setOpen, items, update, remove, subtotal, count } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0" data-testid="cart-drawer">
        <SheetHeader className="px-6 py-5 border-b border-black/5">
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Basket
            <span className="ml-auto text-sm font-bold text-nigeria-orange">{count} item{count === 1 ? "" : "s"}</span>
          </SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center" data-testid="cart-empty">
            <div className="w-24 h-24 rounded-full bg-nigeria-lime/20 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-nigeria-dark" />
            </div>
            <h3 className="font-display text-xl font-bold">Your basket is empty</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Start adding your favourite Naija staples and watch the magic happen.</p>
            <Button
              onClick={() => {
                setOpen(false);
                navigate("/shop");
              }}
              className="btn-primary"
              data-testid="cart-start-shopping"
            >
              Start shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-nigeria-cream/50 rounded-2xl p-3" data-testid={`cart-item-${item.id}`}>
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug}`} onClick={() => setOpen(false)} className="font-bold text-sm leading-tight line-clamp-2 text-nigeria-dark hover:text-nigeria-orange">
                      {item.name}
                    </Link>
                    <div className="mt-1 text-sm font-bold text-nigeria-orange">${(item.price * item.qty).toFixed(2)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center bg-white border border-black/5 rounded-full overflow-hidden">
                        <button
                          onClick={() => update(item.id, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-nigeria-lime/30"
                          data-testid={`decrease-${item.id}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold" data-testid={`qty-${item.id}`}>{item.qty}</span>
                        <button
                          onClick={() => update(item.id, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-nigeria-lime/30"
                          data-testid={`increase-${item.id}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="ml-auto text-muted-foreground hover:text-nigeria-orange"
                        aria-label="Remove"
                        data-testid={`remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-black/5 p-6 space-y-3 bg-white">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-bold text-nigeria-dark" data-testid="cart-subtotal">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Shipping calculated at checkout</span>
                <span className="text-nigeria-lime font-bold">Free over $79</span>
              </div>
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
                className="w-full btn-primary"
                data-testid="cart-checkout-btn"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="w-full text-sm"
                data-testid="cart-continue"
              >
                Continue shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
