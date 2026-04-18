"""
Brianna.app Backend API Tests
Tests all endpoints for Nigerian foodstuff delivery app
"""
import pytest
import requests
import os
import uuid
import time

# Base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://brianna-naijabox.preview.emergentagent.com"

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@brianna.app"
ADMIN_PASSWORD = "Admin@Brianna2026"
TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex[:8]}@brianna.app"
TEST_USER_PASSWORD = "Test@User2026"
TEST_USER_NAME = "Test User"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """GET /api/ - health check"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Brianna.app API"
        assert data["status"] == "ok"
        print(f"✓ Health check passed: {data}")


class TestProducts:
    """Product endpoints tests"""
    
    def test_list_products(self):
        """GET /api/products - list products (45 seeded items)"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Listed {len(data)} products")
        # Verify product structure
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "price" in product
        assert "slug" in product
    
    def test_featured_products(self):
        """GET /api/products?featured=true&limit=8 - featured products"""
        response = requests.get(f"{BASE_URL}/api/products?featured=true&limit=8")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 8
        # All should be featured
        for product in data:
            assert product.get("featured") == True
        print(f"✓ Got {len(data)} featured products")
    
    def test_categories(self):
        """GET /api/products/categories - list categories"""
        response = requests.get(f"{BASE_URL}/api/products/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify category structure
        category = data[0]
        assert "name" in category
        assert "count" in category
        print(f"✓ Got {len(data)} categories: {[c['name'] for c in data]}")
    
    def test_product_detail(self):
        """GET /api/products/egusi-seeds - product detail with reviews and related"""
        response = requests.get(f"{BASE_URL}/api/products/egusi-seeds")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "egusi-seeds"
        assert "name" in data
        assert "price" in data
        assert "reviews" in data
        assert "related" in data
        assert isinstance(data["reviews"], list)
        assert isinstance(data["related"], list)
        print(f"✓ Got product detail: {data['name']} - ${data['price']}")
    
    def test_search_and_sort(self):
        """GET /api/products?q=egusi&sort=price_asc - search + sort filters"""
        response = requests.get(f"{BASE_URL}/api/products?q=egusi&sort=price_asc")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify search results contain egusi
        for product in data:
            name_lower = product["name"].lower()
            desc_lower = product.get("description", "").lower()
            tags = [t.lower() for t in product.get("tags", [])]
            assert "egusi" in name_lower or "egusi" in desc_lower or "egusi" in tags
        # Verify sorted by price ascending
        prices = [p["price"] for p in data]
        assert prices == sorted(prices)
        print(f"✓ Search returned {len(data)} results, sorted by price")


class TestSubscriptions:
    """Subscription tiers endpoint tests"""
    
    def test_subscription_tiers(self):
        """GET /api/subscriptions/tiers - 3 subscription tiers"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/tiers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        tier_ids = [t["id"] for t in data]
        assert "starter" in tier_ids
        assert "family" in tier_ids
        assert "premium" in tier_ids
        print(f"✓ Got 3 subscription tiers: {tier_ids}")


class TestShipping:
    """Shipping rates endpoint tests"""
    
    def test_shipping_rates(self):
        """GET /api/shipping/rates - shipping rates"""
        response = requests.get(f"{BASE_URL}/api/shipping/rates")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "US" in data
        assert "UK" in data
        assert "NG" in data
        # Verify rate structure
        us_rates = data["US"]
        assert "standard" in us_rates
        assert "express" in us_rates
        print(f"✓ Got shipping rates for {len(data)} countries")


class TestAuth:
    """Authentication endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session for cookie handling"""
        self.session = requests.Session()
    
    def test_register_new_user(self):
        """POST /api/auth/register - new user creates account"""
        response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL.lower()
        assert data["name"] == TEST_USER_NAME
        assert data["role"] == "customer"
        # Check cookies are set
        assert "access_token" in self.session.cookies or response.cookies.get("access_token")
        print(f"✓ Registered new user: {data['email']}")
    
    def test_login_admin(self):
        """POST /api/auth/login - admin login"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"✓ Admin login successful: {data['email']}")
    
    def test_get_current_user(self):
        """GET /api/auth/me - returns current user using cookies"""
        # First login
        self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        # Then get me
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Got current user: {data['email']}")
    
    def test_logout(self):
        """POST /api/auth/logout - clears cookies"""
        # First login
        self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        # Then logout
        response = self.session.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] == True
        # Verify can't access protected route
        me_response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 401
        print("✓ Logout successful, cookies cleared")
    
    def test_refresh_token(self):
        """POST /api/auth/refresh - refreshes access token"""
        # First login
        self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        # Then refresh
        response = self.session.post(f"{BASE_URL}/api/auth/refresh")
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] == True
        print("✓ Token refresh successful")


class TestCheckout:
    """Checkout/Stripe endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session and get product ID"""
        self.session = requests.Session()
        # Get a product ID for testing
        products = requests.get(f"{BASE_URL}/api/products?limit=1").json()
        self.product_id = products[0]["id"] if products else None
    
    def test_checkout_cart(self):
        """POST /api/checkout/cart - creates Stripe session for cart"""
        if not self.product_id:
            pytest.skip("No products available")
        
        response = self.session.post(f"{BASE_URL}/api/checkout/cart", json={
            "origin_url": "https://brianna-naijabox.preview.emergentagent.com",
            "items": [{"product_id": self.product_id, "quantity": 2}],
            "shipping_country": "US",
            "shipping_method": "standard"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert "order_id" in data
        assert data["url"].startswith("https://checkout.stripe.com")
        print(f"✓ Cart checkout created: session_id={data['session_id'][:20]}...")
        return data["session_id"]
    
    def test_checkout_subscription(self):
        """POST /api/checkout/subscription - creates Stripe session for subscription"""
        response = self.session.post(f"{BASE_URL}/api/checkout/subscription", json={
            "origin_url": "https://brianna-naijabox.preview.emergentagent.com",
            "tier_id": "family"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert "subscription_id" in data
        print(f"✓ Subscription checkout created: session_id={data['session_id'][:20]}...")
        return data["session_id"]
    
    def test_checkout_status(self):
        """GET /api/checkout/status/{session_id} - polls Stripe status"""
        # First create a checkout session
        if not self.product_id:
            pytest.skip("No products available")
        
        create_response = self.session.post(f"{BASE_URL}/api/checkout/cart", json={
            "origin_url": "https://brianna-naijabox.preview.emergentagent.com",
            "items": [{"product_id": self.product_id, "quantity": 1}],
            "shipping_country": "US",
            "shipping_method": "standard"
        })
        session_id = create_response.json()["session_id"]
        
        # Poll status
        response = self.session.get(f"{BASE_URL}/api/checkout/status/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "payment_status" in data
        # New sessions should be 'open' with 'unpaid' status, or 'initiated' with 'pending' if Stripe API unavailable
        assert data["status"] in ["open", "complete", "expired", "initiated"]
        assert data["payment_status"] in ["unpaid", "paid", "pending"]
        print(f"✓ Checkout status: {data['status']}, payment: {data['payment_status']}")


class TestAuthenticatedEndpoints:
    """Tests for endpoints requiring authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session"""
        self.session = requests.Session()
        # Login as admin
        self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        # Get a product for testing
        products = requests.get(f"{BASE_URL}/api/products?limit=1").json()
        self.product_id = products[0]["id"] if products else None
    
    def test_add_review(self):
        """POST /api/reviews - authenticated user adds review"""
        if not self.product_id:
            pytest.skip("No products available")
        
        response = self.session.post(f"{BASE_URL}/api/reviews", json={
            "product_id": self.product_id,
            "rating": 5,
            "comment": "TEST_Excellent quality egusi seeds!"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["rating"] == 5
        assert "TEST_" in data["comment"]
        assert data["product_id"] == self.product_id
        print(f"✓ Review added: rating={data['rating']}")
    
    def test_toggle_wishlist(self):
        """POST /api/wishlist/toggle - toggle wishlist"""
        if not self.product_id:
            pytest.skip("No products available")
        
        # Add to wishlist
        response = self.session.post(f"{BASE_URL}/api/wishlist/toggle", json={
            "product_id": self.product_id
        })
        assert response.status_code == 200
        data = response.json()
        assert "wishlist" in data
        assert self.product_id in data["wishlist"]
        print(f"✓ Added to wishlist: {len(data['wishlist'])} items")
        
        # Remove from wishlist
        response = self.session.post(f"{BASE_URL}/api/wishlist/toggle", json={
            "product_id": self.product_id
        })
        assert response.status_code == 200
        data = response.json()
        assert self.product_id not in data["wishlist"]
        print(f"✓ Removed from wishlist")
    
    def test_get_wishlist(self):
        """GET /api/wishlist - list wishlist products"""
        response = self.session.get(f"{BASE_URL}/api/wishlist")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got wishlist: {len(data)} items")
    
    def test_list_orders(self):
        """GET /api/orders - list authenticated user orders"""
        response = self.session.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got orders: {len(data)} orders")
    
    def test_list_subscriptions(self):
        """GET /api/subscriptions - list authenticated user subscriptions"""
        response = self.session.get(f"{BASE_URL}/api/subscriptions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got subscriptions: {len(data)} subscriptions")


class TestChatbot:
    """AI Recipe Chatbot endpoint tests"""
    
    def test_chat_message(self):
        """POST /api/chat - AI recipe chatbot with Emergent LLM"""
        response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "What can I make with egusi seeds?",
            "context_items": ["egusi", "palm oil", "stockfish"]
        }, timeout=30)  # LLM may take time
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "reply" in data
        assert len(data["reply"]) > 0
        print(f"✓ Chat response received: {data['reply'][:100]}...")
        return data["session_id"]
    
    def test_chat_history(self):
        """GET /api/chat/{session_id} - chat history"""
        # First create a chat session
        chat_response = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "Hello Brianna!",
        }, timeout=30)
        session_id = chat_response.json()["session_id"]
        
        # Get history
        response = requests.get(f"{BASE_URL}/api/chat/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Got chat history: {len(data)} messages")


class TestAdminEndpoints:
    """Admin-only endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup admin session"""
        self.admin_session = requests.Session()
        self.admin_session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        # Setup non-admin session
        self.user_session = requests.Session()
        # Register a test user
        test_email = f"nonadmin_{uuid.uuid4().hex[:8]}@test.com"
        self.user_session.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "TestPass123",
            "name": "Non Admin"
        })
    
    def test_admin_stats(self):
        """GET /api/admin/stats - admin only"""
        response = self.admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "products" in data
        assert "orders" in data
        assert "active_subscriptions" in data
        assert "revenue" in data
        print(f"✓ Admin stats: {data['products']} products, {data['users']} users")
    
    def test_admin_stats_forbidden_for_non_admin(self):
        """GET /api/admin/stats - 403 for non-admin"""
        response = self.user_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 403
        print("✓ Non-admin correctly denied access to admin stats")
    
    def test_admin_create_product(self):
        """POST /api/admin/products - admin creates product"""
        response = self.admin_session.post(f"{BASE_URL}/api/admin/products", json={
            "name": "TEST_Product",
            "slug": f"test-product-{uuid.uuid4().hex[:8]}",
            "category": "Test Category",
            "description": "Test product for automated testing",
            "price": 9.99,
            "image": "https://example.com/test.jpg",
            "stock": 50,
            "tags": ["test"],
            "featured": False
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Product"
        assert "id" in data
        print(f"✓ Admin created product: {data['id']}")
        return data["id"]
    
    def test_admin_delete_product(self):
        """DELETE /api/admin/products/{id} - admin deletes product"""
        # First create a product
        create_response = self.admin_session.post(f"{BASE_URL}/api/admin/products", json={
            "name": "TEST_ToDelete",
            "slug": f"test-delete-{uuid.uuid4().hex[:8]}",
            "category": "Test Category",
            "description": "Product to be deleted",
            "price": 1.99,
            "image": "https://example.com/test.jpg"
        })
        product_id = create_response.json()["id"]
        
        # Delete it
        response = self.admin_session.delete(f"{BASE_URL}/api/admin/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] == True
        print(f"✓ Admin deleted product: {product_id}")
    
    def test_admin_list_orders(self):
        """GET /api/admin/orders - admin lists all orders"""
        response = self.admin_session.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin got {len(data)} orders")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
