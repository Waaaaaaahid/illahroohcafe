/**
 * In-memory mock backend. Preview only — mirrors the Express API contract so
 * services can swap to the real API without any UI change.
 */
import {
  mockCafeSettings,
  mockCategories,
  mockMenuItems,
  mockOrders,
  mockPayments,
  mockUsers,
} from "@/lib/mock/mockData";
import type {
  AuthSession,
  CafeSettings,
  Category,
  CustomerDetails,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentMethod,
  User,
} from "@/lib/types";

const db = {
  menu: [...mockMenuItems],
  categories: [...mockCategories],
  orders: [...mockOrders],
  payments: [...mockPayments],
  users: [...mockUsers],
  settings: { ...mockCafeSettings },
};

const delay = (ms = 420) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const id = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

export const mockApi = {
  /* ---------------------------------------------------------------- menu */
  async listMenu(): Promise<MenuItem[]> {
    await delay();
    return clone(db.menu);
  },
  async getMenuItem(itemId: string): Promise<MenuItem> {
    await delay(250);
    const found = db.menu.find((item) => item._id === itemId);
    if (!found) throw new Error("Menu item not found");
    return clone(found);
  },
  async createMenuItem(input: Omit<MenuItem, "_id" | "createdAt" | "updatedAt">): Promise<MenuItem> {
    await delay();
    const item: MenuItem = { ...input, _id: id("m"), createdAt: now(), updatedAt: now() };
    db.menu = [item, ...db.menu];
    return clone(item);
  },
  async updateMenuItem(itemId: string, input: Partial<MenuItem>): Promise<MenuItem> {
    await delay();
    let updated: MenuItem | undefined;
    db.menu = db.menu.map((item) =>
      item._id === itemId ? (updated = { ...item, ...input, updatedAt: now() }) : item,
    );
    if (!updated) throw new Error("Menu item not found");
    return clone(updated);
  },
  async deleteMenuItem(itemId: string): Promise<{ _id: string }> {
    await delay();
    db.menu = db.menu.filter((item) => item._id !== itemId);
    return { _id: itemId };
  },

  /* ---------------------------------------------------------- categories */
  async listCategories(): Promise<Category[]> {
    await delay(320);
    return clone(db.categories);
  },
  async createCategory(input: Omit<Category, "_id">): Promise<Category> {
    await delay();
    const category: Category = { ...input, _id: id("c") };
    db.categories = [...db.categories, category];
    return clone(category);
  },
  async updateCategory(categoryId: string, input: Partial<Category>): Promise<Category> {
    await delay();
    let updated: Category | undefined;
    db.categories = db.categories.map((category) =>
      category._id === categoryId ? (updated = { ...category, ...input }) : category,
    );
    if (!updated) throw new Error("Category not found");
    return clone(updated);
  },
  async deleteCategory(categoryId: string): Promise<{ _id: string }> {
    await delay();
    db.categories = db.categories.filter((category) => category._id !== categoryId);
    return { _id: categoryId };
  },

  /* -------------------------------------------------------------- orders */
  async listOrders(): Promise<Order[]> {
    await delay();
    return clone(db.orders);
  },
  async listMyOrders(userId: string): Promise<Order[]> {
    await delay();
    return clone(db.orders.filter((order) => order.user === userId));
  },
  async getOrder(orderId: string): Promise<Order> {
    await delay(300);
    const found = db.orders.find((order) => order._id === orderId || order.code === orderId);
    if (!found) throw new Error("Order not found");
    return clone(found);
  },
  async createOrder(input: {
    userId?: string;
    customerDetails: CustomerDetails;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
  }): Promise<Order> {
    await delay(700);
    const order: Order = {
      _id: id("o"),
      code: `MN-${10242 + db.orders.length}`,
      user: input.userId ?? "",
      customerDetails: input.customerDetails,
      items: input.items,
      subtotal: input.subtotal,
      tax: input.tax,
      deliveryFee: input.deliveryFee,
      totalAmount: input.totalAmount,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "online" ? "paid" : "pending",
      orderStatus: "Pending",
      createdAt: now(),
      updatedAt: now(),
    };
    db.orders = [order, ...db.orders];
    db.payments = [
      {
        _id: id("p"),
        order: order._id,
        user: order.user,
        razorpayOrderId: input.paymentMethod === "online" ? `order_MOCK${order.code}` : null,
        razorpayPaymentId: input.paymentMethod === "online" ? `pay_MOCK${order.code}` : null,
        amount: order.totalAmount,
        currency: db.settings.currency,
        status: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: now(),
      },
      ...db.payments,
    ];
    return clone(order);
  },
  async updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<Order> {
    await delay(350);
    let updated: Order | undefined;
    db.orders = db.orders.map((order) =>
      order._id === orderId ? (updated = { ...order, orderStatus, updatedAt: now() }) : order,
    );
    if (!updated) throw new Error("Order not found");
    return clone(updated);
  },

  /* ------------------------------------------------------------ payments */
  async listPayments(): Promise<Payment[]> {
    await delay();
    return clone(db.payments);
  },

  /* --------------------------------------------------------------- users */
  async listUsers(): Promise<User[]> {
    await delay();
    return clone(db.users);
  },
  async updateUserRole(userId: string, role: User["role"]): Promise<User> {
    await delay(300);
    let updated: User | undefined;
    db.users = db.users.map((user) => (user._id === userId ? (updated = { ...user, role }) : user));
    if (!updated) throw new Error("User not found");
    return clone(updated);
  },
  async deleteUser(userId: string): Promise<{ _id: string }> {
    await delay(300);
    db.users = db.users.filter((user) => user._id !== userId);
    return { _id: userId };
  },

  /* ------------------------------------------------------------ settings */
  async getSettings(): Promise<CafeSettings> {
    await delay(200);
    return clone(db.settings);
  },
  async updateSettings(input: Partial<CafeSettings>): Promise<CafeSettings> {
    await delay();
    db.settings = { ...db.settings, ...input };
    return clone(db.settings);
  },

  /* ---------------------------------------------------------------- auth */
  async login(email: string, password: string): Promise<AuthSession> {
    await delay(600);
    if (!password) throw new Error("Password is required");
    const existing = db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    const user: User = existing ?? {
      _id: id("u"),
      name: email.split("@")[0] ?? "Guest",
      email,
      phone: "+91 00000 00000",
      role: email.toLowerCase().startsWith("admin") ? "admin" : "user",
      createdAt: now(),
    };
    if (!existing) db.users = [...db.users, user];
    return { token: `mock.jwt.${user._id}`, user: clone(user) };
  },
  async register(input: {
    name: string;
    email: string;
    phone: string;
  }): Promise<AuthSession> {
    await delay(700);
    const user: User = {
      _id: id("u"),
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.email.toLowerCase().startsWith("admin") ? "admin" : "user",
      createdAt: now(),
    };
    db.users = [...db.users, user];
    return { token: `mock.jwt.${user._id}`, user: clone(user) };
  },
  async updateProfile(userId: string, input: Partial<User>): Promise<User> {
    await delay(400);
    let updated: User | undefined;
    db.users = db.users.map((user) =>
      user._id === userId ? (updated = { ...user, ...input }) : user,
    );
    if (!updated) throw new Error("User not found");
    return clone(updated);
  },
  async forgotPassword(email: string): Promise<{ message: string }> {
    await delay(600);
    return { message: `Reset instructions sent to ${email}` };
  },
  async resetPassword(): Promise<{ message: string }> {
    await delay(600);
    return { message: "Password updated" };
  },
};
