/**
 * Shared domain types. These mirror the Mongoose schemas in /backend/models.
 */

export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string; // category slug (populated as Category on the real API)
  image: string;
  available: boolean;
  popular: boolean;
  vegetarian: boolean;
  sku?: string | undefined;
  brand?: string | undefined;
  compareAtPrice?: number | undefined;
  stock?: number | undefined;
  badge?: string | undefined;
  rating?: number | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  itemId: string;
  name: string;
  price: number;
  image: string;
  vegetarian: boolean;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string | undefined;
}

export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  item: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  code: string;
  user: string;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  order: string;
  user: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export type AnnouncementAnimation = "fade" | "slide" | "static";

export interface AnnouncementItem {
  id: string;
  text: string;
  enabled: boolean;
  order: number;
  durationSeconds: number;
  animation: AnnouncementAnimation;
  backgroundColor: string;
  textColor: string;
  link: string;
  startsAt: string | null;
  endsAt: string | null;
}

export interface AnnouncementBarConfig {
  enabled: boolean;
  defaultDurationSeconds: number;
  animation: AnnouncementAnimation;
  announcements: AnnouncementItem[];
}

export interface CafeSettings {
  announcementBar: AnnouncementBarConfig;
  name: string;
  logo: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  openingHours: { day: string; hours: string }[];
  socialLinks: { instagram: string; facebook: string; twitter: string };
  deliveryFee: number;
  taxPercentage: number;
  currency: string;
  whatsappNumber: string;
  whatsappSalesNumber: string;
  whatsappSupportNumber: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
