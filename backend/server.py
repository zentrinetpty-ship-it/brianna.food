from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)
from emergentintegrations.llm.chat import LlmChat, UserMessage

from seed_data import PRODUCTS_SEED, SUBSCRIPTION_TIERS

# -------------------- Setup --------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
STRIPE_API_KEY = os.environ["STRIPE_API_KEY"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

app = FastAPI(title="Brianna.app API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("brianna")


# -------------------- Password / JWT helpers --------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=4),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 4, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 24 * 7, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


# -------------------- Models --------------------
class RegisterReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class ProductIn(BaseModel):
    name: str
    slug: str
    category: str
    subcategory: Optional[str] = None
    description: str
    price: float
    weight: Optional[str] = None
    origin: Optional[str] = "Nigeria"
    image: str
    stock: int = 100
    tags: List[str] = []
    featured: bool = False


class CartItemReq(BaseModel):
    product_id: str
    quantity: int = 1


class CheckoutReq(BaseModel):
    origin_url: str
    items: List[CartItemReq]
    shipping_country: str = "US"
    shipping_method: str = "standard"
    coupon: Optional[str] = None


class SubscriptionCheckoutReq(BaseModel):
    origin_url: str
    tier_id: str


class ReviewReq(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str


class ChatReq(BaseModel):
    session_id: Optional[str] = None
    message: str
    context_items: Optional[List[str]] = None


# -------------------- Auth Routes --------------------
@api.post("/auth/register")
async def register(body: RegisterReq, response: Response):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": email,
        "name": body.name,
        "password_hash": hash_password(body.password),
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "addresses": [],
        "wishlist": [],
    }
    await db.users.insert_one(doc)
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"id": uid, "email": email, "name": body.name, "role": "customer"}


@api.post("/auth/login")
async def login(body: LoginReq, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    access = create_access_token(user["id"], email)
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user.get("role", "customer")}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    rt = request.cookies.get("refresh_token")
    if not rt:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(rt, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid refresh")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(401, "User not found")
        new_access = create_access_token(user["id"], user["email"])
        response.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="none", max_age=60 * 60 * 4, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


# -------------------- Products --------------------
@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    q: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "featured",
    limit: int = 48,
):
    query: Dict[str, Any] = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q.lower()]}},
        ]
    if min_price is not None or max_price is not None:
        price_q: Dict[str, Any] = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        query["price"] = price_q

    sort_opts = {
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "rating": [("rating", -1)],
        "new": [("created_at", -1)],
        "featured": [("featured", -1), ("rating", -1)],
    }
    cursor = db.products.find(query, {"_id": 0}).sort(sort_opts.get(sort, sort_opts["featured"])).limit(limit)
    return await cursor.to_list(limit)


@api.get("/products/categories")
async def categories():
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    res = await db.products.aggregate(pipeline).to_list(100)
    return [{"name": r["_id"], "count": r["count"]} for r in res]


@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    reviews = await db.reviews.find({"product_id": p["id"]}, {"_id": 0}).sort([("created_at", -1)]).limit(20).to_list(20)
    p["reviews"] = reviews
    related = await db.products.find(
        {"category": p["category"], "id": {"$ne": p["id"]}}, {"_id": 0}
    ).limit(4).to_list(4)
    p["related"] = related
    return p


# -------------------- Reviews --------------------
@api.post("/reviews")
async def add_review(body: ReviewReq, user=Depends(get_current_user)):
    rid = str(uuid.uuid4())
    doc = {
        "id": rid,
        "product_id": body.product_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "rating": body.rating,
        "comment": body.comment,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reviews.insert_one(doc)
    all_r = await db.reviews.find({"product_id": body.product_id}, {"_id": 0, "rating": 1}).to_list(1000)
    if all_r:
        avg = sum(r["rating"] for r in all_r) / len(all_r)
        await db.products.update_one(
            {"id": body.product_id},
            {"$set": {"rating": round(avg, 1), "reviews_count": len(all_r)}},
        )
    doc.pop("_id", None)
    return doc


# -------------------- Wishlist --------------------
@api.post("/wishlist/toggle")
async def toggle_wishlist(body: dict, user=Depends(get_current_user)):
    pid = body.get("product_id")
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0, "wishlist": 1})
    wl = u.get("wishlist", []) if u else []
    if pid in wl:
        wl.remove(pid)
    else:
        wl.append(pid)
    await db.users.update_one({"id": user["id"]}, {"$set": {"wishlist": wl}})
    return {"wishlist": wl}


@api.get("/wishlist")
async def get_wishlist(user=Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0, "wishlist": 1})
    ids = u.get("wishlist", []) if u else []
    if not ids:
        return []
    prods = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(1000)
    return prods


# -------------------- Subscription Tiers --------------------
@api.get("/subscriptions/tiers")
async def get_tiers():
    return SUBSCRIPTION_TIERS


# -------------------- Shipping --------------------
SHIPPING_RATES = {
    "US": {"standard": 19.99, "express": 39.99},
    "UK": {"standard": 22.99, "express": 44.99},
    "CA": {"standard": 21.99, "express": 42.99},
    "DE": {"standard": 24.99, "express": 49.99},
    "AU": {"standard": 29.99, "express": 59.99},
    "FR": {"standard": 24.99, "express": 49.99},
    "NL": {"standard": 24.99, "express": 49.99},
    "NG": {"standard": 9.99, "express": 19.99},
    "OTHER": {"standard": 34.99, "express": 69.99},
}


@api.get("/shipping/rates")
async def shipping_rates():
    return SHIPPING_RATES


def get_shipping_cost(country: str, method: str) -> float:
    rates = SHIPPING_RATES.get(country.upper(), SHIPPING_RATES["OTHER"])
    return rates.get(method, rates["standard"])


# -------------------- Checkout (Stripe) --------------------
async def _create_stripe_session(
    request: Request,
    origin_url: str,
    amount: float,
    metadata: Dict[str, str],
    kind: str,
    user_id: Optional[str],
) -> Dict[str, Any]:
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    success_url = f"{origin_url.rstrip('/')}/checkout/status?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url.rstrip('/')}/cart"
    req = CheckoutSessionRequest(
        amount=float(f"{amount:.2f}"),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session = await stripe_checkout.create_checkout_session(req)
    txn = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user_id,
        "kind": kind,
        "amount": amount,
        "currency": "usd",
        "metadata": metadata,
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(txn)
    return {"url": session.url, "session_id": session.session_id}


@api.post("/checkout/cart")
async def checkout_cart(body: CheckoutReq, request: Request, user=Depends(get_optional_user)):
    if not body.items:
        raise HTTPException(400, "Cart is empty")
    ids = [i.product_id for i in body.items]
    prods = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(1000)
    price_by_id = {p["id"]: p for p in prods}
    subtotal = 0.0
    line_items = []
    for it in body.items:
        p = price_by_id.get(it.product_id)
        if not p:
            raise HTTPException(400, f"Invalid product {it.product_id}")
        line_total = p["price"] * it.quantity
        subtotal += line_total
        line_items.append({"id": p["id"], "name": p["name"], "price": p["price"], "qty": it.quantity})

    shipping = get_shipping_cost(body.shipping_country, body.shipping_method)
    discount = 0.0
    if body.coupon and body.coupon.upper() == "NAIJA10":
        discount = round(subtotal * 0.10, 2)
    total = round(subtotal + shipping - discount, 2)

    order_id = str(uuid.uuid4())
    await db.orders.insert_one({
        "id": order_id,
        "user_id": user["id"] if user else None,
        "user_email": user["email"] if user else None,
        "items": line_items,
        "subtotal": round(subtotal, 2),
        "shipping": shipping,
        "discount": discount,
        "total": total,
        "shipping_country": body.shipping_country,
        "shipping_method": body.shipping_method,
        "status": "pending_payment",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    meta = {
        "order_id": order_id,
        "kind": "cart",
        "user_email": (user["email"] if user else "guest"),
    }
    result = await _create_stripe_session(
        request, body.origin_url, total, meta, "cart", user["id"] if user else None
    )
    result["order_id"] = order_id
    return result


@api.post("/checkout/subscription")
async def checkout_subscription(body: SubscriptionCheckoutReq, request: Request, user=Depends(get_optional_user)):
    tier = next((t for t in SUBSCRIPTION_TIERS if t["id"] == body.tier_id), None)
    if not tier:
        raise HTTPException(400, "Invalid tier")
    total = tier["price"]
    sub_id = str(uuid.uuid4())
    await db.subscriptions.insert_one({
        "id": sub_id,
        "user_id": user["id"] if user else None,
        "user_email": user["email"] if user else None,
        "tier_id": tier["id"],
        "tier_name": tier["name"],
        "price": total,
        "status": "pending_payment",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    meta = {"subscription_id": sub_id, "kind": "subscription", "tier_id": tier["id"]}
    result = await _create_stripe_session(
        request, body.origin_url, total, meta, "subscription", user["id"] if user else None
    )
    result["subscription_id"] = sub_id
    return result


@api.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Transaction not found")
    if existing.get("payment_status") == "paid":
        return {
            "status": existing.get("status", "complete"),
            "payment_status": "paid",
            "amount_total": int(existing.get("amount", 0) * 100),
            "currency": "usd",
            "metadata": existing.get("metadata", {}),
        }
    try:
        status_resp = await stripe_checkout.get_checkout_status(session_id)
        update = {
            "status": status_resp.status,
            "payment_status": status_resp.payment_status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update})
        if status_resp.payment_status == "paid":
            meta = existing.get("metadata", {}) or {}
            if meta.get("kind") == "cart" and meta.get("order_id"):
                await db.orders.update_one({"id": meta["order_id"]}, {"$set": {"status": "paid"}})
            elif meta.get("kind") == "subscription" and meta.get("subscription_id"):
                next_delivery = datetime.now(timezone.utc) + timedelta(days=7)
                await db.subscriptions.update_one(
                    {"id": meta["subscription_id"]},
                    {"$set": {"status": "active", "next_delivery": next_delivery.isoformat()}},
                )
        return {
            "status": status_resp.status,
            "payment_status": status_resp.payment_status,
            "amount_total": status_resp.amount_total,
            "currency": status_resp.currency,
            "metadata": status_resp.metadata,
        }
    except Exception as e:
        logger.warning(f"Stripe status check failed for {session_id}: {e}")
        # Return existing transaction data when Stripe API fails
        return {
            "status": existing.get("status", "initiated"),
            "payment_status": existing.get("payment_status", "pending"),
            "amount_total": int(existing.get("amount", 0) * 100),
            "currency": existing.get("currency", "usd"),
            "metadata": existing.get("metadata", {}),
        }


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    host_url = str(request.base_url)
    webhook_url = f"{host_url.rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    body_bytes = await request.body()
    try:
        resp = await stripe_checkout.handle_webhook(body_bytes, request.headers.get("Stripe-Signature"))
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"ok": False}
    if resp.session_id and resp.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": resp.session_id},
            {"$set": {"payment_status": "paid", "status": "complete"}},
        )
    return {"ok": True}


# -------------------- Orders --------------------
@api.get("/orders")
async def list_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort([("created_at", -1)]).to_list(200)
    return orders


@api.get("/subscriptions")
async def list_subscriptions(user=Depends(get_current_user)):
    subs = await db.subscriptions.find({"user_id": user["id"]}, {"_id": 0}).sort([("created_at", -1)]).to_list(50)
    return subs


# -------------------- AI Recipe Assistant --------------------
SYSTEM_PROMPT = """You are Brianna, a warm Nigerian grandma-chef and recipe assistant for Brianna.app — a worldwide Nigerian foodstuff delivery service for the diaspora.
- Help customers choose ingredients, plan meals, share authentic Nigerian recipes (Jollof rice, Egusi soup, Oha soup, Pounded yam, Suya, Moi moi, Akara, Pepper soup, Banga, Nkwobi, Ofada stew, Ewedu, Okra soup, Nsala, etc.).
- Mention how ingredients in their cart can be used.
- Keep answers warm, concise, culturally rich, use emojis sparingly (1-2 max), and offer 1 suggested next action.
- Format longer responses with markdown headers and step-by-step numbered lists when giving recipes.
- Respond in friendly, encouraging tone."""


@api.post("/chat")
async def chat(body: ChatReq):
    sid = body.session_id or str(uuid.uuid4())
    sys_msg = SYSTEM_PROMPT
    if body.context_items:
        sys_msg += f"\n\nThe customer currently has these items in their cart: {', '.join(body.context_items)}."
    try:
        llm = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=sid, system_message=sys_msg).with_model(
            "anthropic", "claude-sonnet-4-5-20250929"
        )
        reply = await llm.send_message(UserMessage(text=body.message))
    except Exception as e:
        logger.exception("LLM error")
        raise HTTPException(500, f"AI assistant error: {str(e)}")
    doc = {
        "session_id": sid,
        "user": body.message,
        "assistant": reply,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_messages.insert_one(doc)
    return {"session_id": sid, "reply": reply}


@api.get("/chat/{session_id}")
async def chat_history(session_id: str):
    msgs = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort([("created_at", 1)]).to_list(200)
    return msgs


# -------------------- Admin --------------------
async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin required")
    return user


@api.post("/admin/products")
async def admin_create(body: ProductIn, user=Depends(require_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["rating"] = 4.7
    doc["reviews_count"] = 0
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/admin/products/{pid}")
async def admin_delete(pid: str, user=Depends(require_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}


@api.get("/admin/orders")
async def admin_orders(user=Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(500)


@api.get("/admin/stats")
async def admin_stats(user=Depends(require_admin)):
    users = await db.users.count_documents({})
    products = await db.products.count_documents({})
    orders = await db.orders.count_documents({})
    subs = await db.subscriptions.count_documents({"status": "active"})
    revenue_agg = await db.orders.aggregate(
        [{"$match": {"status": "paid"}}, {"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    ).to_list(1)
    revenue = revenue_agg[0]["total"] if revenue_agg else 0
    return {"users": users, "products": products, "orders": orders, "active_subscriptions": subs, "revenue": revenue}


# -------------------- Root --------------------
@api.get("/")
async def root():
    return {"name": "Brianna.app API", "status": "ok"}


# -------------------- Startup --------------------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("category")
    await db.reviews.create_index("product_id")
    await db.payment_transactions.create_index("session_id", unique=True)

    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Brianna Admin",
            "password_hash": hash_password(admin_pw),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "addresses": [],
            "wishlist": [],
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})

    count = await db.products.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc).isoformat()
        docs = []
        for p in PRODUCTS_SEED:
            d = {**p}
            d["id"] = str(uuid.uuid4())
            d["rating"] = p.get("rating", 4.7)
            d["reviews_count"] = p.get("reviews_count", 0)
            d["created_at"] = now
            docs.append(d)
        await db.products.insert_many(docs)
        logger.info(f"Seeded {len(docs)} products")


app.include_router(api)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
