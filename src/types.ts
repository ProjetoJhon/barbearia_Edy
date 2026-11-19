export type UserRole = 'client' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: 'Cabelo' | 'Barba' | 'Combo' | 'Acabamento';
  active: boolean;
  featured?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photo: string;
  rating: number;
  completedCuts: number;
  workDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  startHour: string; // "09:00"
  endHour: string;   // "20:00"
  active: boolean;
}

export type ProductCategory = 'Pomadas' | 'Óleos para Barba' | 'Shampoos' | 'Kits';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  promoPrice?: number;
  stock: number;
  image: string;
  active: boolean;
  featured?: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentMethod = 'pix' | 'credit_card' | 'in_shop';
export type PaymentStatus = 'pending' | 'paid';

export interface Appointment {
  id: string;
  userId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  originalPrice?: number;
  discountApplied?: number;
  appliedRewardId?: string;
  serviceDuration: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  installments?: number;
  notes?: string;
  pointsEarned?: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ProductOrder {
  id: string;
  userId: string;
  clientName: string;
  clientPhone: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountApplied?: number;
  appliedRewardId?: string;
  deliveryFee: number;
  total: number;
  fulfillment: 'pickup' | 'delivery';
  deliveryAddress?: string;
  paymentMethod: 'pix' | 'credit_card';
  paymentStatus: PaymentStatus;
  installments?: number;
  status: 'preparing' | 'ready' | 'delivered' | 'cancelled';
  pointsEarned?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  userId: string;
  clientName: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  serviceRating: number; // 1-5
  barberRating: number;  // 1-5
  comment: string;
  status: 'approved' | 'hidden';
  createdAt: string;
}

export interface LoyaltyConfig {
  enabled: boolean;
  pointsPerRealService: number;
  bookingBonusPoints: number;
  pointsPerRealProduct: number;
  productBonusPoints: number;
}

export interface RewardOption {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountAmount: number;
  appliesTo: 'service' | 'product' | 'both';
  active: boolean;
}

export interface RedeemedReward {
  id: string;
  code: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  discountAmount: number;
  appliesTo: 'service' | 'product' | 'both';
  pointsSpent: number;
  status: 'available' | 'used';
  redeemedAt: string;
  usedAt?: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'adjust';
  points: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface DaySchedule {
  dayIndex: number; // 0 = Dom .. 6 = Sáb
  dayLabel: string;
  shortLabel: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  whatsappUrl: string;
  instagramHandle: string;
  address: string;
  neighborhood: string;
  topNoticeEnabled: boolean;
  topNoticeText: string;
  customLogoUrl: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  schedule: DaySchedule[];
}

export type ClientView = 'home' | 'booking' | 'shop' | 'appointments' | 'rewards' | 'auth';
export type AdminTab = 'dashboard' | 'agenda' | 'services' | 'products' | 'barbers' | 'reviews' | 'loyalty' | 'settings';
