import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_BARBERS,
  INITIAL_LOYALTY_CONFIG,
  INITIAL_ORDERS,
  INITIAL_POINT_TRANSACTIONS,
  INITIAL_PRODUCTS,
  INITIAL_REDEEMED_REWARDS,
  INITIAL_REVIEWS,
  INITIAL_REWARDS,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from '../data/seedData';
import {
  Appointment,
  AppointmentStatus,
  Barber,
  CartItem,
  LoyaltyConfig,
  PaymentMethod,
  PaymentStatus,
  PointTransaction,
  Product,
  ProductOrder,
  RedeemedReward,
  Review,
  RewardOption,
  Service,
  ShopSettings,
  User,
} from '../types';

const STORAGE_KEYS = {
  users: 'edyk_v1_users',
  currentUser: 'edyk_v1_current_user',
  services: 'edyk_v1_services',
  barbers: 'edyk_v1_barbers',
  products: 'edyk_v1_products',
  appointments: 'edyk_v1_appointments',
  orders: 'edyk_v1_orders',
  settings: 'edyk_v1_settings',
  cart: 'edyk_v1_cart',
  reviews: 'edyk_v1_reviews',
  loyaltyConfig: 'edyk_v1_loyalty_config',
  rewards: 'edyk_v1_rewards',
  redeemedRewards: 'edyk_v1_redeemed_rewards',
  pointTransactions: 'edyk_v1_point_transactions',
};

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextValue {
  users: User[];
  currentUser: User | null;
  services: Service[];
  barbers: Barber[];
  products: Product[];
  appointments: Appointment[];
  orders: ProductOrder[];
  settings: ShopSettings;
  cart: CartItem[];
  reviews: Review[];
  loyaltyConfig: LoyaltyConfig;
  rewards: RewardOption[];
  redeemedRewards: RedeemedReward[];
  pointTransactions: PointTransaction[];
  toasts: ToastMessage[];
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Auth
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  registerClient: (data: { name: string; email: string; phone: string; password: string }) => { ok: boolean; error?: string; user?: User };
  logout: () => void;

  // Appointments
  createAppointment: (payload: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  markAppointmentPaid: (id: string, method: PaymentMethod, installments?: number) => void;
  isSlotTaken: (barberId: string, date: string, time: string, ignoreAppointmentId?: string) => boolean;

  // Services CRUD
  saveService: (service: Omit<Service, 'id'> & { id?: string }) => void;
  deleteService: (id: string) => void;

  // Products CRUD
  saveProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  deleteProduct: (id: string) => void;

  // Barbers CRUD
  saveBarber: (barber: Omit<Barber, 'id'> & { id?: string }) => void;
  deleteBarber: (id: string) => void;

  // Reviews & Moderation
  submitReview: (payload: {
    appointmentId: string;
    barberId: string;
    barberName: string;
    serviceId: string;
    serviceName: string;
    serviceRating: number;
    barberRating: number;
    comment: string;
  }) => Review;
  moderateReview: (reviewId: string, status: 'approved' | 'hidden') => void;
  deleteReview: (reviewId: string) => void;
  getBarberRatingStats: (barberId: string, fallbackRating: number) => { average: number; count: number };

  // Loyalty & Rewards
  getUserPoints: (userId?: string) => number;
  calculateServicePoints: (servicePrice: number) => number;
  calculateProductPoints: (subtotal: number) => number;
  redeemReward: (rewardId: string) => { ok: boolean; error?: string; redeemed?: RedeemedReward };
  updateLoyaltyConfig: (patch: Partial<LoyaltyConfig>) => void;
  saveReward: (reward: Omit<RewardOption, 'id'> & { id?: string }) => void;
  deleteReward: (id: string) => void;

  // Cart & Orders
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  createProductOrder: (payload: {
    fulfillment: 'pickup' | 'delivery';
    deliveryAddress?: string;
    paymentMethod: 'pix' | 'credit_card';
    paymentStatus: PaymentStatus;
    installments?: number;
    clientName?: string;
    clientPhone?: string;
    appliedRewardId?: string;
  }) => ProductOrder;

  // Settings CMS
  updateSettings: (patch: Partial<ShopSettings>) => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadState(STORAGE_KEYS.users, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadState(STORAGE_KEYS.currentUser, null));
  const [services, setServices] = useState<Service[]>(() => loadState(STORAGE_KEYS.services, INITIAL_SERVICES));
  const [barbers, setBarbers] = useState<Barber[]>(() => loadState(STORAGE_KEYS.barbers, INITIAL_BARBERS));
  const [products, setProducts] = useState<Product[]>(() => loadState(STORAGE_KEYS.products, INITIAL_PRODUCTS));
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadState(STORAGE_KEYS.appointments, INITIAL_APPOINTMENTS)
  );
  const [orders, setOrders] = useState<ProductOrder[]>(() => loadState(STORAGE_KEYS.orders, INITIAL_ORDERS));
  const [settings, setSettings] = useState<ShopSettings>(() => loadState(STORAGE_KEYS.settings, INITIAL_SETTINGS));
  const [cart, setCart] = useState<CartItem[]>(() => loadState(STORAGE_KEYS.cart, []));
  const [reviews, setReviews] = useState<Review[]>(() => loadState(STORAGE_KEYS.reviews, INITIAL_REVIEWS));
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>(() =>
    loadState(STORAGE_KEYS.loyaltyConfig, INITIAL_LOYALTY_CONFIG)
  );
  const [rewards, setRewards] = useState<RewardOption[]>(() => loadState(STORAGE_KEYS.rewards, INITIAL_REWARDS));
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>(() =>
    loadState(STORAGE_KEYS.redeemedRewards, INITIAL_REDEEMED_REWARDS)
  );
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>(() =>
    loadState(STORAGE_KEYS.pointTransactions, INITIAL_POINT_TRANSACTIONS)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); } catch { /* ignore */ }
  }, [users]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser)); } catch { /* ignore */ }
  }, [currentUser]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services)); } catch { /* ignore */ }
  }, [services]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.barbers, JSON.stringify(barbers)); } catch { /* ignore */ }
  }, [barbers]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products)); } catch { /* ignore */ }
  }, [products]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments)); } catch { /* ignore */ }
  }, [appointments]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders)); } catch { /* ignore */ }
  }, [orders]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews)); } catch { /* ignore */ }
  }, [reviews]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.loyaltyConfig, JSON.stringify(loyaltyConfig)); } catch { /* ignore */ }
  }, [loyaltyConfig]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.rewards, JSON.stringify(rewards)); } catch { /* ignore */ }
  }, [rewards]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.redeemedRewards, JSON.stringify(redeemedRewards)); } catch { /* ignore */ }
  }, [redeemedRewards]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.pointTransactions, JSON.stringify(pointTransactions)); } catch { /* ignore */ }
  }, [pointTransactions]);

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, text, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  const login = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!found) {
      return { ok: false, error: 'E-mail ou senha incorretos. Verifique seus dados ou use o acesso rápido.' };
    }
    setCurrentUser(found);
    notify(`Bem-vindo, ${found.name.split(' ')[0]}!`);
    return { ok: true, user: found };
  };

  const registerClient = (data: { name: string; email: string; phone: string; password: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'Já existe uma conta cadastrada com este e-mail.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      password: data.password,
      role: 'client',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    notify('Conta criada com sucesso! Seja bem-vindo à EDY-K.');
    return { ok: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    notify('Você saiu da sua conta.', 'info');
  };

  const calculateServicePoints = (servicePrice: number) => {
    if (!loyaltyConfig.enabled) return 0;
    return Math.max(0, Math.round(servicePrice * loyaltyConfig.pointsPerRealService) + loyaltyConfig.bookingBonusPoints);
  };

  const calculateProductPoints = (subtotal: number) => {
    if (!loyaltyConfig.enabled) return 0;
    return Math.max(0, Math.round(subtotal * loyaltyConfig.pointsPerRealProduct) + loyaltyConfig.productBonusPoints);
  };

  const getUserPoints = (userId?: string) => {
    const uid = userId || currentUser?.id;
    if (!uid) return 0;
    return Math.max(
      0,
      pointTransactions
        .filter((tx) => tx.userId === uid)
        .reduce((sum, tx) => sum + tx.points, 0)
    );
  };

  const redeemReward: StoreContextValue['redeemReward'] = (rewardId) => {
    if (!currentUser) {
      return { ok: false, error: 'Faça login para resgatar recompensas.' };
    }
    const reward = rewards.find((r) => r.id === rewardId && r.active);
    if (!reward) {
      return { ok: false, error: 'Recompensa não disponível no momento.' };
    }
    const balance = getUserPoints(currentUser.id);
    if (balance < reward.pointsCost) {
      return { ok: false, error: `Você precisa de ${reward.pointsCost} pontos para este resgate.` };
    }

    const code = `EDYK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const today = new Date().toISOString().slice(0, 10);
    const redeemed: RedeemedReward = {
      id: `red-${Date.now()}`,
      code,
      userId: currentUser.id,
      rewardId: reward.id,
      rewardTitle: reward.title,
      discountAmount: reward.discountAmount,
      appliesTo: reward.appliesTo,
      pointsSpent: reward.pointsCost,
      status: 'available',
      redeemedAt: today,
    };

    const tx: PointTransaction = {
      id: `ptx-${Date.now()}`,
      userId: currentUser.id,
      type: 'redeem',
      points: -reward.pointsCost,
      description: `Resgate: ${reward.title}`,
      referenceId: redeemed.id,
      createdAt: today,
    };

    setRedeemedRewards((prev) => [redeemed, ...prev]);
    setPointTransactions((prev) => [tx, ...prev]);
    notify(`Cupom ${code} resgatado com sucesso!`);
    return { ok: true, redeemed };
  };

  const isSlotTaken = (barberId: string, date: string, time: string, ignoreAppointmentId?: string) => {
    return appointments.some(
      (a) =>
        a.id !== ignoreAppointmentId &&
        a.barberId === barberId &&
        a.date === date &&
        a.time === time &&
        a.status !== 'cancelled'
    );
  };

  const createAppointment = (payload: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const aptId = `apt-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().slice(0, 10);
    const earned =
      payload.userId !== 'guest' && payload.userId !== 'walk-in'
        ? calculateServicePoints(payload.servicePrice)
        : 0;

    if (payload.appliedRewardId) {
      setRedeemedRewards((prev) =>
        prev.map((r) =>
          r.id === payload.appliedRewardId ? { ...r, status: 'used', usedAt: today } : r
        )
      );
    }

    if (earned > 0) {
      const tx: PointTransaction = {
        id: `ptx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        userId: payload.userId,
        type: 'earn',
        points: earned,
        description: `Agendamento: ${payload.serviceName}`,
        referenceId: aptId,
        createdAt: today,
      };
      setPointTransactions((prev) => [tx, ...prev]);
    }

    const created: Appointment = {
      ...payload,
      id: aptId,
      pointsEarned: earned,
      createdAt: today,
    };
    setAppointments((prev) => [created, ...prev]);
    return created;
  };

  const updateAppointment = (id: string, patch: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const target = appointments.find((a) => a.id === id);
    if (target && status === 'cancelled' && target.status !== 'cancelled' && target.pointsEarned && target.pointsEarned > 0) {
      const tx: PointTransaction = {
        id: `ptx-rev-${Date.now()}`,
        userId: target.userId,
        type: 'adjust',
        points: -target.pointsEarned,
        description: `Estorno por cancelamento: ${target.serviceName}`,
        referenceId: target.id,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setPointTransactions((prev) => [tx, ...prev]);
    }
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const markAppointmentPaid = (id: string, method: PaymentMethod, installments?: number) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              paymentMethod: method,
              paymentStatus: 'paid',
              status: a.status === 'pending' ? 'confirmed' : a.status,
              installments,
            }
          : a
      )
    );
  };

  const saveService = (service: Omit<Service, 'id'> & { id?: string }) => {
    if (service.id) {
      setServices((prev) => prev.map((s) => (s.id === service.id ? ({ ...s, ...service } as Service) : s)));
      notify('Serviço atualizado na vitrine.');
    } else {
      const created: Service = { ...service, id: `srv-${Date.now()}` };
      setServices((prev) => [...prev, created]);
      notify('Novo serviço adicionado.');
    }
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    notify('Serviço removido.', 'info');
  };

  const saveProduct = (product: Omit<Product, 'id'> & { id?: string }) => {
    if (product.id) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? ({ ...p, ...product } as Product) : p)));
      notify('Produto atualizado na loja.');
    } else {
      const created: Product = { ...product, id: `prod-${Date.now()}` };
      setProducts((prev) => [created, ...prev]);
      notify('Produto cadastrado no catálogo.');
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((c) => c.productId !== id));
    notify('Produto removido da loja.', 'info');
  };

  const saveBarber = (barber: Omit<Barber, 'id'> & { id?: string }) => {
    if (barber.id) {
      setBarbers((prev) => prev.map((b) => (b.id === barber.id ? ({ ...b, ...barber } as Barber) : b)));
      notify('Perfil do profissional atualizado.');
    } else {
      const created: Barber = { ...barber, id: `barber-${Date.now()}` };
      setBarbers((prev) => [...prev, created]);
      notify('Profissional adicionado ao elenco.');
    }
  };

  const deleteBarber = (id: string) => {
    setBarbers((prev) => prev.filter((b) => b.id !== id));
    notify('Profissional removido do elenco.', 'info');
  };

  // Reviews & Moderation
  const submitReview: StoreContextValue['submitReview'] = (payload) => {
    const created: Review = {
      id: `rev-${Date.now()}`,
      appointmentId: payload.appointmentId,
      userId: currentUser?.id || 'guest',
      clientName: currentUser?.name || 'Cliente EDY-K',
      barberId: payload.barberId,
      barberName: payload.barberName,
      serviceId: payload.serviceId,
      serviceName: payload.serviceName,
      serviceRating: payload.serviceRating,
      barberRating: payload.barberRating,
      comment: payload.comment.trim(),
      status: 'approved',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setReviews((prev) => [created, ...prev]);
    notify('Avaliação publicada! Obrigado pelo feedback.');
    return created;
  };

  const moderateReview = (reviewId: string, status: 'approved' | 'hidden') => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
    notify(status === 'approved' ? 'Avaliação aprovada e visível.' : 'Avaliação ocultada da vitrine.', 'info');
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    notify('Avaliação removida permanentemente.', 'info');
  };

  const getBarberRatingStats = (barberId: string, fallbackRating: number) => {
    const approved = reviews.filter((r) => r.barberId === barberId && r.status === 'approved');
    if (approved.length === 0) {
      return { average: fallbackRating, count: 0 };
    }
    const sum = approved.reduce((acc, r) => acc + r.barberRating, 0);
    return {
      average: Number((sum / approved.length).toFixed(2)),
      count: approved.length,
    };
  };

  // Loyalty Admin
  const updateLoyaltyConfig = (patch: Partial<LoyaltyConfig>) => {
    setLoyaltyConfig((prev) => ({ ...prev, ...patch }));
    notify('Regras de pontuação atualizadas!');
  };

  const saveReward = (reward: Omit<RewardOption, 'id'> & { id?: string }) => {
    if (reward.id) {
      setRewards((prev) => prev.map((r) => (r.id === reward.id ? ({ ...r, ...reward } as RewardOption) : r)));
      notify('Recompensa atualizada.');
    } else {
      const created: RewardOption = { ...reward, id: `rew-${Date.now()}` };
      setRewards((prev) => [...prev, created]);
      notify('Nova recompensa criada.');
    }
  };

  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    notify('Recompensa removida.', 'info');
  };

  const addToCart = (productId: string, quantity = 1) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || prod.stock <= 0) {
      notify('Produto sem estoque no momento.', 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      const nextQty = Math.min(prod.stock, (existing?.quantity || 0) + quantity);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, { productId, quantity: nextQty }];
    });
    notify(`${prod.name} adicionado ao carrinho.`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const prod = products.find((p) => p.id === productId);
    const capped = prod ? Math.min(prod.stock, quantity) : quantity;
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: capped } : i)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return acc;
      const unitPrice = prod.promoPrice ?? prod.price;
      return acc + unitPrice * item.quantity;
    }, 0);
  }, [cart, products]);

  const createProductOrder: StoreContextValue['createProductOrder'] = ({
    fulfillment,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
    installments,
    clientName,
    clientPhone,
    appliedRewardId,
  }) => {
    const items = cart
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          name: prod.name,
          price: prod.promoPrice ?? prod.price,
          quantity: item.quantity,
          image: prod.image,
        };
      })
      .filter(Boolean) as ProductOrder['items'];

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const rewardObj = appliedRewardId
      ? redeemedRewards.find((r) => r.id === appliedRewardId && r.status === 'available')
      : undefined;
    const discountApplied = rewardObj ? Math.min(subtotal, rewardObj.discountAmount) : 0;
    const discountedSubtotal = Math.max(0, subtotal - discountApplied);
    const deliveryFee =
      fulfillment === 'delivery' && subtotal < settings.freeDeliveryThreshold ? settings.deliveryFee : 0;
    const today = new Date().toISOString().slice(0, 10);
    const orderId = `ord-${Date.now().toString().slice(-5)}`;
    const earned = currentUser ? calculateProductPoints(discountedSubtotal) : 0;

    if (rewardObj) {
      setRedeemedRewards((prev) =>
        prev.map((r) => (r.id === rewardObj.id ? { ...r, status: 'used', usedAt: today } : r))
      );
    }

    if (earned > 0 && currentUser) {
      const tx: PointTransaction = {
        id: `ptx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        userId: currentUser.id,
        type: 'earn',
        points: earned,
        description: `Compra na Loja #${orderId.toUpperCase()}`,
        referenceId: orderId,
        createdAt: today,
      };
      setPointTransactions((prev) => [tx, ...prev]);
    }

    const order: ProductOrder = {
      id: orderId,
      userId: currentUser?.id || 'guest',
      clientName: clientName || currentUser?.name || 'Cliente Visitante',
      clientPhone: clientPhone || currentUser?.phone || '(11) 99999-0000',
      items,
      subtotal,
      discountApplied,
      appliedRewardId: rewardObj?.id,
      deliveryFee,
      total: discountedSubtotal + deliveryFee,
      fulfillment,
      deliveryAddress: fulfillment === 'delivery' ? deliveryAddress : undefined,
      paymentMethod,
      paymentStatus,
      installments,
      status: 'preparing',
      pointsEarned: earned,
      createdAt: today,
    };

    // Deduct stock in real time
    setProducts((prev) =>
      prev.map((prod) => {
        const ordered = items.find((i) => i.productId === prod.id);
        if (!ordered) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - ordered.quantity) };
      })
    );

    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  const updateSettings = (patch: Partial<ShopSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    notify('Configurações da barbearia salvas e publicadas!');
  };

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setServices(INITIAL_SERVICES);
    setBarbers(INITIAL_BARBERS);
    setProducts(INITIAL_PRODUCTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setOrders(INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    setReviews(INITIAL_REVIEWS);
    setLoyaltyConfig(INITIAL_LOYALTY_CONFIG);
    setRewards(INITIAL_REWARDS);
    setRedeemedRewards(INITIAL_REDEEMED_REWARDS);
    setPointTransactions(INITIAL_POINT_TRANSACTIONS);
    setCart([]);
    notify('Dados de demonstração restaurados.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        users,
        currentUser,
        services,
        barbers,
        products,
        appointments,
        orders,
        settings,
        cart,
        reviews,
        loyaltyConfig,
        rewards,
        redeemedRewards,
        pointTransactions,
        toasts,
        notify,
        login,
        registerClient,
        logout,
        createAppointment,
        updateAppointment,
        updateAppointmentStatus,
        markAppointmentPaid,
        isSlotTaken,
        saveService,
        deleteService,
        saveProduct,
        deleteProduct,
        saveBarber,
        deleteBarber,
        submitReview,
        moderateReview,
        deleteReview,
        getBarberRatingStats,
        getUserPoints,
        calculateServicePoints,
        calculateProductPoints,
        redeemReward,
        updateLoyaltyConfig,
        saveReward,
        deleteReward,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        createProductOrder,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
