import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { CheckCircle2, Loader2, XCircle, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutStatus() {
  const [params] = useSearchParams();
  const session_id = params.get("session_id");
  const [status, setStatus] = useState("polling");
  const [data, setData] = useState(null);
  const attemptsRef = useRef(0);
  const { clear } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session_id) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      attemptsRef.current += 1;
      if (attemptsRef.current > 10) {
        setStatus("timeout");
        return;
      }
      try {
        const { data: resp } = await api.get(`/checkout/status/${session_id}`);
        setData(resp);
        if (resp.payment_status === "paid") {
          setStatus("paid");
          clear();
          return;
        }
        if (resp.status === "expired") {
          setStatus("expired");
          return;
        }
        setTimeout(poll, 2000);
      } catch (e) {
        setStatus("error");
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [session_id, clear]);

  return (
    <div className="brianna-container py-16 md:py-24 max-w-2xl text-center" data-testid="checkout-status-page">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        {status === "polling" && (
          <>
            <div className="w-24 h-24 rounded-full bg-nigeria-lime/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 animate-spin text-nigeria-dark" />
            </div>
            <h1 className="font-display font-black text-4xl text-nigeria-dark mt-6" data-testid="status-polling-title">Confirming your order</h1>
            <p className="text-muted-foreground mt-2">Brianna's counting the yams...</p>
          </>
        )}
        {status === "paid" && (
          <>
            <div className="w-24 h-24 rounded-full bg-nigeria-lime flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-nigeria-dark" />
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-nigeria-dark mt-6" data-testid="status-paid-title">Order confirmed! 🎉</h1>
            <p className="text-muted-foreground mt-3 text-lg">Your Naija goodness is on the way. We'll email you tracking details shortly.</p>
            {data?.amount_total && (
              <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-nigeria-cream border border-nigeria-lime">
                <Package className="w-4 h-4 text-nigeria-dark" />
                <span className="font-bold">Total charged: ${(data.amount_total / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/account?tab=orders" className="btn-primary" data-testid="view-orders-btn">View my orders <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/shop" className="btn-outline-dark" data-testid="continue-shop-btn">Keep shopping</Link>
            </div>
          </>
        )}
        {(status === "expired" || status === "timeout" || status === "error") && (
          <>
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="font-display font-black text-4xl text-nigeria-dark mt-6">Payment not completed</h1>
            <p className="text-muted-foreground mt-2">{status === "timeout" ? "Check your email for confirmation or try again." : "Your session expired. Try again — we saved your basket."}</p>
            <button onClick={() => navigate("/checkout")} className="mt-6 btn-primary" data-testid="retry-btn">Try again</button>
          </>
        )}
      </motion.div>
    </div>
  );
}
