# Brianna.app — PRD

## Original Problem Statement
Build a full-stack Nigerian foodstuff worldwide delivery app called Brianna.app with products like egusi, stockfish, oha leaf etc. Include a monthly box subscription option. Use bright lime-green, orange and dark-green colors; dopamine-inducing; shadcn components; rich modern e-commerce UI with animations. Blow my mind.

## User Choices
- **Auth**: JWT-based custom auth (email + password, httpOnly cookies)
- **Payments**: Stripe (test key `sk_test_emergent`)
- **AI**: Emergent Universal LLM key with **Claude Sonnet 4.5**
- **Subscription Box**: 3 tiers (Starter / Family / Premium) + Custom box builder
- **Images**: Curated Unsplash/Pexels stock photos + 2 generated assets (hero box, ankara texture)

## Architecture
- **Backend**: FastAPI + MongoDB (motor) at `/api`
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui + framer-motion + react-fast-marquee
- **Fonts**: Cabinet Grotesk + Satoshi (via Fontshare CDN)
- **Color system**: lime #95D600, orange #FF5500, dark green #064E3B, cream #FAF9F6
- **State**: AuthContext (session), CartContext (localStorage-backed)

## User Personas
1. **Diaspora home cook** — buys authentic staples, wants recipes
2. **Busy professional** — subscribes to monthly box on autopilot
3. **Party host** — bulk orders for events (Jollof parties, weddings)
4. **Admin** — manages catalog, tracks orders & revenue

## Core Requirements (static)
- Authentic Nigerian catalog (45 products, 10 categories)
- Worldwide shipping calculator (9 countries)
- Cart, checkout, Stripe payment + polling
- Monthly subscription tiers + custom box builder
- AI recipe assistant (cart-aware)
- User account with orders, subscriptions, wishlist
- Admin dashboard with stats, product CRUD, orders
- Full shadcn/ui responsive components with framer motion

## What's Been Implemented (Feb 18 2026)

### Backend (/api/*)
- Auth: register, login, logout, /me, /refresh (JWT in httpOnly cookies, bcrypt)
- Products: list (category, q, sort, price), categories, detail (with reviews + related)
- Reviews: create + auto-rating recompute
- Wishlist: toggle + list
- Subscription tiers endpoint
- Shipping rates endpoint
- Checkout: cart (Stripe session), subscription (Stripe session), status polling, webhook
- Orders + subscriptions list (authenticated)
- AI chat: POST /api/chat (Claude Sonnet 4.5 via emergentintegrations), GET chat history
- Admin: stats, products CRUD, orders list
- Startup: admin seeding, 45 product seed, indexes

### Frontend (Pages)
- Home: hero with monthly-box image + stats, marquee, category bento, featured products, monthly-box CTA, why-us, latest, testimonials, newsletter
- Shop: category + price + search + sort filters, product grid
- Product Detail: gallery, tabs (details/reviews/shipping), related, add-to-cart
- Monthly Box: tier cards + custom builder toggle
- Checkout: shipping, method, coupon, summary sidebar → Stripe redirect
- Checkout Status: polling UI with success/expired/error states
- Auth: login + register with split-screen brand panel
- Account: orders, subscriptions, wishlist, profile tabs
- Admin: stats, product management, orders table
- Recipes: editorial recipe cards
- About: story + values

### Integrations
- Stripe checkout (one-time + subscription tiers) with transaction polling
- Claude Sonnet 4.5 AI recipe assistant via Emergent LLM key
- JWT auth with httpOnly cookies

### Testing
- ✅ 28 backend endpoints tested, 100% pass rate (iteration_1.json)

## Prioritized Backlog

### P0 (next)
- Real recurring Stripe subscriptions (today subscription creates a one-time payment for the first month)
- Product detail image gallery (multi-image)
- Address book + saved addresses for checkout

### P1
- Reviews with verified-buyer badge + photo upload
- Order tracking with shipping partner integration
- Multi-currency pricing
- Email notifications (order confirmation, shipping update)

### P2
- Mobile app (React Native)
- Loyalty/points program
- Blog CMS
- Referral program
- Gift cards / redeemable codes

## Credentials
See `/app/memory/test_credentials.md`
