// Mock in-memory database for development while Neon is unavailable
const mockDb = {
  products: [],
  users: [],
  orders: [],
  reviews: [],
  addresses: [],
  newsletters: [],
  promos: [],
};

let productIdCounter = 1;
let orderIdCounter = 1;

export const mockDbOperations = {
  // Products
  createProduct: (data) => {
    console.log("[mockDb] Creating product with data:", data);
    const product = {
      id: String(productIdCounter++),
      ...data,
      createdAt: new Date(),
    };
    mockDb.products.push(product);
    console.log("[mockDb] Product created:", product);
    return product;
  },

  listProducts: (limit = 100) => {
    return mockDb.products.slice(0, limit);
  },

  getProductById: (id) => {
    return mockDb.products.find((p) => p.id === id);
  },

  updateProduct: (id, data) => {
    const idx = mockDb.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      mockDb.products[idx] = { ...mockDb.products[idx], ...data };
      return mockDb.products[idx];
    }
    return null;
  },

  deleteProduct: (id) => {
    mockDb.products = mockDb.products.filter((p) => p.id !== id);
    return true;
  },

  listSellerProducts: (userId) => {
    return mockDb.products.filter((p) => p.userId === userId);
  },

  // Orders
  createOrder: (data) => {
    const order = {
      id: String(orderIdCounter++),
      ...data,
      createdAt: new Date(),
    };
    mockDb.orders.push(order);
    return order;
  },

  listOrders: (limit = 100) => {
    return mockDb.orders.slice(0, limit);
  },

  listSellerOrders: (userId) => {
    return mockDb.orders.filter((o) => o.sellerId === userId);
  },

  updateOrderStatus: (orderId, status) => {
    const order = mockDb.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      return order;
    }
    return null;
  },

  // Users
  createUser: (data) => {
    const user = { ...data, createdAt: new Date() };
    mockDb.users.push(user);
    return user;
  },

  getUserById: (id) => {
    return mockDb.users.find((u) => u.id === id);
  },

  // Cart (stored in user)
  updateUserCart: (userId, items) => {
    const user = mockDb.users.find((u) => u.id === userId);
    if (user) {
      user.cartItems = items;
      return user;
    }
    return null;
  },

  // Reviews
  createReview: (data) => {
    const review = { ...data, createdAt: new Date() };
    mockDb.reviews.push(review);
    return review;
  },

  listProductReviews: (productId) => {
    return mockDb.reviews.filter((r) => r.productId === productId);
  },

  // Newsletter
  subscribeNewsletter: (email) => {
    if (!mockDb.newsletters.find((n) => n.email === email)) {
      mockDb.newsletters.push({ email, subscribedAt: new Date() });
      return true;
    }
    return false;
  },

  // Promo
  createPromo: (data) => {
    const promo = { ...data, createdAt: new Date() };
    mockDb.promos.push(promo);
    return promo;
  },

  listPromos: () => {
    return mockDb.promos;
  },

  // Debug
  reset: () => {
    mockDb.products = [];
    mockDb.users = [];
    mockDb.orders = [];
    mockDb.reviews = [];
    mockDb.addresses = [];
    mockDb.newsletters = [];
    mockDb.promos = [];
    productIdCounter = 1;
    orderIdCounter = 1;
  },
};

export default mockDbOperations;
