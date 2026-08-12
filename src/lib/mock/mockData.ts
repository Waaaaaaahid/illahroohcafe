import type { CafeSettings, Category, MenuItem, Order, Payment, User } from "@/lib/types";

/**
 * MOCK DATA — preview/demo only.
 * This layer exists purely so the UI can be developed before the Express API
 * is connected. Nothing here is a source of truth. Flip VITE_USE_MOCK_API to
 * "false" and the services in src/services/* hit the real backend instead.
 */

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

export const mockCategories: Category[] = [
  { _id: "c1", name: "Coffee", slug: "coffee", description: "Single-origin espresso & slow brews", image: img("1447933601403-0c6688de566e"), active: true },
  { _id: "c2", name: "Burgers", slug: "burgers", description: "Smash patties on brioche", image: img("1568901346375-23c9450c58cd"), active: true },
  { _id: "c3", name: "Pizza", slug: "pizza", description: "Stone-baked, 48h fermented dough", image: img("1513104890138-7c749659a591"), active: true },
  { _id: "c4", name: "Pasta", slug: "pasta", description: "Hand-rolled, small batch", image: img("1621996346565-e3dbc353d2e5"), active: true },
  { _id: "c5", name: "Desserts", slug: "desserts", description: "Patisserie made each morning", image: img("1551024506-0bccd828d307"), active: true },
  { _id: "c6", name: "Beverages", slug: "beverages", description: "Cold pressed & sparkling", image: img("1544145945-f90425340c7e"), active: true },
  { _id: "c7", name: "Snacks", slug: "snacks", description: "Small plates for the in-between", image: img("1541592106381-b31e9677c0e5"), active: true },
];

export const mockMenuItems: MenuItem[] = [
  { _id: "m1", name: "Signature Cappuccino", description: "Double ristretto, silk-steamed milk, cocoa dust.", price: 240, category: "coffee", image: img("1572442388796-11668a67e53d"), available: true, popular: true, vegetarian: true, rating: 4.9, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m2", name: "Ethiopian Pour Over", description: "Yirgacheffe beans, jasmine and stone fruit notes.", price: 320, category: "coffee", image: img("1495474472287-4d71bcdd2085"), available: true, popular: true, vegetarian: true, rating: 4.8, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m3", name: "Salted Caramel Latte", description: "House caramel, flaked sea salt, velvet foam.", price: 280, category: "coffee", image: img("1461023058943-07fcbe16d735"), available: true, popular: false, vegetarian: true, rating: 4.6, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m4", name: "Truffle Smash Burger", description: "Aged cheddar, truffle aioli, brioche bun.", price: 520, category: "burgers", image: img("1568901346375-23c9450c58cd"), available: true, popular: true, vegetarian: false, rating: 4.9, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m5", name: "Garden Halloumi Burger", description: "Grilled halloumi, roasted pepper, basil pesto.", price: 460, category: "burgers", image: img("1550547660-d9450f859349"), available: true, popular: false, vegetarian: true, rating: 4.5, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m6", name: "Margherita Reserve", description: "San Marzano, fior di latte, Genovese basil.", price: 540, category: "pizza", image: img("1513104890138-7c749659a591"), available: true, popular: true, vegetarian: true, rating: 4.8, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m7", name: "Smoked Chicken Pizza", description: "Applewood chicken, caramelised onion, scamorza.", price: 620, category: "pizza", image: img("1565299624946-b28f40a0ae38"), available: false, popular: false, vegetarian: false, rating: 4.4, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m8", name: "Truffle Tagliatelle", description: "Fresh egg pasta, black truffle, parmigiano.", price: 680, category: "pasta", image: img("1621996346565-e3dbc353d2e5"), available: true, popular: true, vegetarian: true, rating: 4.9, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m9", name: "Arrabbiata Rigatoni", description: "Slow cooked tomato, chilli, aged pecorino.", price: 520, category: "pasta", image: img("1551183053-bf91a1d81141"), available: true, popular: false, vegetarian: true, rating: 4.5, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m10", name: "Basque Cheesecake", description: "Burnt top, molten centre, vanilla bean.", price: 380, category: "desserts", image: img("1551024506-0bccd828d307"), available: true, popular: true, vegetarian: true, rating: 4.9, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m11", name: "Dark Chocolate Tart", description: "70% ganache, hazelnut praline crumb.", price: 340, category: "desserts", image: img("1578985545062-69928b1d9587"), available: true, popular: false, vegetarian: true, rating: 4.7, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m12", name: "Cold Pressed Citrus", description: "Orange, grapefruit, ginger, mint.", price: 260, category: "beverages", image: img("1544145945-f90425340c7e"), available: true, popular: false, vegetarian: true, rating: 4.4, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m13", name: "Iced Matcha Cloud", description: "Ceremonial matcha, oat milk, vanilla cold foam.", price: 300, category: "beverages", image: img("1515823064-d6e0c04616a7"), available: true, popular: true, vegetarian: true, rating: 4.6, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m14", name: "Truffle Parmesan Fries", description: "Triple cooked, truffle oil, parsley.", price: 320, category: "snacks", image: img("1541592106381-b31e9677c0e5"), available: true, popular: true, vegetarian: true, rating: 4.7, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m15", name: "Peri Peri Chicken Wings", description: "Charred wings, house peri sauce, lime.", price: 420, category: "snacks", image: img("1608039755401-742074f0548d"), available: true, popular: false, vegetarian: false, rating: 4.5, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
  { _id: "m16", name: "Croissant & Butter", description: "72-hour laminated, cultured butter.", price: 220, category: "snacks", image: img("1555507036-ab1f4038808a"), available: true, popular: false, vegetarian: true, rating: 4.6, createdAt: "2026-01-04T09:00:00Z", updatedAt: "2026-01-04T09:00:00Z" },
];

export const mockUsers: User[] = [
  { _id: "u1", name: "Aarav Mehta", email: "user@cafe.dev", phone: "+91 98200 11223", role: "user", createdAt: "2025-11-02T10:00:00Z" },
  { _id: "u2", name: "Nisha Kapoor", email: "admin@cafe.dev", phone: "+91 98200 44556", role: "admin", createdAt: "2025-08-14T10:00:00Z" },
  { _id: "u3", name: "Rohan Iyer", email: "rohan@cafe.dev", phone: "+91 98200 77889", role: "user", createdAt: "2026-01-19T10:00:00Z" },
  { _id: "u4", name: "Sara Fernandes", email: "sara@cafe.dev", phone: "+91 98200 33445", role: "user", createdAt: "2026-02-21T10:00:00Z" },
];

export const mockOrders: Order[] = [
  {
    _id: "o1", code: "MN-10241", user: "u1",
    customerDetails: { name: "Aarav Mehta", phone: "+91 98200 11223", email: "user@cafe.dev", address: "402, Sea Breeze, Bandra West, Mumbai 400050" },
    items: [
      { item: "m1", name: "Signature Cappuccino", price: 240, quantity: 2 },
      { item: "m10", name: "Basque Cheesecake", price: 380, quantity: 1 },
    ],
    subtotal: 860, tax: 43, deliveryFee: 49, totalAmount: 952,
    paymentMethod: "online", paymentStatus: "paid", orderStatus: "Preparing",
    createdAt: "2026-08-11T06:20:00Z", updatedAt: "2026-08-11T06:40:00Z",
  },
  {
    _id: "o2", code: "MN-10240", user: "u3",
    customerDetails: { name: "Rohan Iyer", phone: "+91 98200 77889", email: "rohan@cafe.dev", address: "12 Palm Grove, Powai, Mumbai 400076" },
    items: [{ item: "m8", name: "Truffle Tagliatelle", price: 680, quantity: 1 }],
    subtotal: 680, tax: 34, deliveryFee: 49, totalAmount: 763,
    paymentMethod: "cod", paymentStatus: "pending", orderStatus: "Out for Delivery",
    createdAt: "2026-08-11T05:05:00Z", updatedAt: "2026-08-11T05:50:00Z",
  },
  {
    _id: "o3", code: "MN-10239", user: "u4",
    customerDetails: { name: "Sara Fernandes", phone: "+91 98200 33445", email: "sara@cafe.dev", address: "8 Rose Villa, Colaba, Mumbai 400005" },
    items: [
      { item: "m4", name: "Truffle Smash Burger", price: 520, quantity: 2 },
      { item: "m14", name: "Truffle Parmesan Fries", price: 320, quantity: 1 },
    ],
    subtotal: 1360, tax: 68, deliveryFee: 0, totalAmount: 1428,
    paymentMethod: "online", paymentStatus: "paid", orderStatus: "Completed",
    createdAt: "2026-08-10T13:15:00Z", updatedAt: "2026-08-10T14:02:00Z",
  },
  {
    _id: "o4", code: "MN-10238", user: "u1",
    customerDetails: { name: "Aarav Mehta", phone: "+91 98200 11223", email: "user@cafe.dev", address: "402, Sea Breeze, Bandra West, Mumbai 400050" },
    items: [{ item: "m6", name: "Margherita Reserve", price: 540, quantity: 1 }],
    subtotal: 540, tax: 27, deliveryFee: 49, totalAmount: 616,
    paymentMethod: "cod", paymentStatus: "failed", orderStatus: "Cancelled",
    createdAt: "2026-08-09T18:40:00Z", updatedAt: "2026-08-09T19:00:00Z",
  },
];

export const mockPayments: Payment[] = [
  { _id: "p1", order: "o1", user: "u1", razorpayOrderId: "order_MOCK0001", razorpayPaymentId: "pay_MOCK0001", amount: 952, currency: "INR", status: "paid", paymentMethod: "online", createdAt: "2026-08-11T06:21:00Z" },
  { _id: "p2", order: "o3", user: "u4", razorpayOrderId: "order_MOCK0003", razorpayPaymentId: "pay_MOCK0003", amount: 1428, currency: "INR", status: "paid", paymentMethod: "online", createdAt: "2026-08-10T13:16:00Z" },
  { _id: "p3", order: "o4", user: "u1", razorpayOrderId: "order_MOCK0004", razorpayPaymentId: null, amount: 616, currency: "INR", status: "failed", paymentMethod: "online", createdAt: "2026-08-09T18:41:00Z" },
  { _id: "p4", order: "o2", user: "u3", razorpayOrderId: null, razorpayPaymentId: null, amount: 763, currency: "INR", status: "pending", paymentMethod: "cod", createdAt: "2026-08-11T05:06:00Z" },
];

export const mockCafeSettings: CafeSettings = {
  name: "Ilarooh",
  logo: "",
  description:
    "A slow-craft coffee house and kitchen in Mumbai. Single-origin roasts, stone-baked plates, and a room built for lingering.",
  phone: "+91 98200 10101",
  email: "hello@ilarooh.cafe",
  address: "14 Waterfield Road, Bandra West, Mumbai 400050",
  openingHours: [
    { day: "Monday – Thursday", hours: "08:00 – 23:00" },
    { day: "Friday – Saturday", hours: "08:00 – 01:00" },
    { day: "Sunday", hours: "09:00 – 22:00" },
  ],
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
  },
  deliveryFee: 49,
  taxPercentage: 5,
  currency: "INR",
  whatsappNumber: "+91 98200 10101",
};

export const mockReviews = [
  { id: "r1", name: "Meera Raghavan", role: "Regular since 2023", rating: 5, text: "The pour over here ruined every other coffee for me. The room smells like roasted cocoa at 8am." },
  { id: "r2", name: "Daniel Alvarez", role: "Food writer", rating: 5, text: "Truffle tagliatelle that would hold its own in a fine-dining room, served in a cafe with worn oak tables." },
  { id: "r3", name: "Priya Nair", role: "Designer", rating: 4, text: "I work here three mornings a week. Fast delivery too — my order arrives still steaming." },
];

export const mockRevenueSeries = [
  { label: "Mon", revenue: 18400, orders: 42 },
  { label: "Tue", revenue: 21200, orders: 48 },
  { label: "Wed", revenue: 19850, orders: 45 },
  { label: "Thu", revenue: 26400, orders: 58 },
  { label: "Fri", revenue: 34100, orders: 74 },
  { label: "Sat", revenue: 41250, orders: 89 },
  { label: "Sun", revenue: 32600, orders: 71 },
];
