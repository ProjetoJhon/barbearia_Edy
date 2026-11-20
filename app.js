/*
 * EDY-K Barbershop — aplicação em JavaScript puro (sem React, sem build).
 * Funciona abrindo index.html diretamente ou através do server.py.
 */
(function () {
  'use strict';

  /* ==========================================================
   * 1. Dados iniciais
   * ========================================================== */
  var IMG = {
    hero: 'assets/images/hero.jpg',
    edy: 'assets/images/barber-edy.jpg',
    elenco: 'assets/images/elenco.jpg',
    matheus: 'assets/images/barber-matheus.jpg',
    pomade: 'assets/images/product-pomade.jpg',
    oil: 'assets/images/product-beard-oil.jpg',
    shampoo: 'assets/images/product-shampoo.jpg',
    kit: 'assets/images/product-kit.jpg'
  };

  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var SEED = {
    users: [
      { id: 'user-admin', name: 'Edy Oliveira (Admin)', email: 'admin@edyk.com', phone: '(11) 98254-1469', password: 'admin123', role: 'admin', createdAt: iso(-120) },
      { id: 'user-demo-client', name: 'Lucas Ferreira', email: 'cliente@edyk.com', phone: '(11) 97412-8830', password: '123456', role: 'client', createdAt: iso(-45) },
      { id: 'user-client-2', name: 'Matheus Almeida', email: 'matheus.a@email.com', phone: '(11) 96521-4410', password: '123456', role: 'client', createdAt: iso(-30) },
      { id: 'user-client-3', name: 'Gabriel Costa', email: 'gabriel.c@email.com', phone: '(11) 98104-2291', password: '123456', role: 'client', createdAt: iso(-18) },
      { id: 'user-client-4', name: 'Thiago Nogueira', email: 'thiago.n@email.com', phone: '(11) 99315-7704', password: '123456', role: 'client', createdAt: iso(-9) }
    ],
    services: [
      { id: 'srv-1', name: 'Corte Degradê (Fade)', description: 'Degradê navalhado ou zero com acabamento preciso na navalha, lavagem e finalização com pomada premium.', price: 55, durationMinutes: 40, category: 'Cabelo', active: true, featured: true },
      { id: 'srv-2', name: 'Combo Corte + Barba', description: 'Nosso ritual completo: corte sob medida, modelagem de barba com toalha quente, óleo essencial e massagem facial.', price: 90, durationMinutes: 70, category: 'Combo', active: true, featured: true },
      { id: 'srv-3', name: 'Barba na Navalha', description: 'Alinhamento completo com espuma quente, vapor de ozônio, navalha tradicional e bálsamo pós-barba hidratante.', price: 45, durationMinutes: 35, category: 'Barba', active: true, featured: true },
      { id: 'srv-4', name: 'Corte Social na Tesoura', description: 'Corte clássico executado inteiramente na tesoura, respeitando caimento natural e textura dos fios.', price: 60, durationMinutes: 45, category: 'Cabelo', active: true, featured: true },
      { id: 'srv-5', name: 'Sobrancelha na Navalha', description: 'Limpeza natural e design masculino com precisão de navalha sem perder a expressão original.', price: 20, durationMinutes: 15, category: 'Acabamento', active: true },
      { id: 'srv-6', name: 'Pigmentação & Acabamento Black', description: 'Realce natural para contornos de cabelo e barba com fixação prolongada e acabamento impecável.', price: 40, durationMinutes: 25, category: 'Acabamento', active: true }
    ],
    barbers: [
      { id: 'barber-1', name: 'Edy Oliveira', specialty: 'Fundador · Master Fade & Visagismo', bio: 'Mais de 10 anos definindo o padrão de precisão da Barbearia Edyk. Especialista em degradê navalhado e consultoria de estilo.', photo: IMG.edy, rating: 4.98, completedCuts: 1420, workDays: [2, 3, 4, 5, 6], startHour: '09:00', endHour: '20:00', active: true },
      { id: 'barber-2', name: 'Matheus Silva', specialty: 'Barba & Corte Clássico', bio: 'Especialista em barba com toalha quente, navalha tradicional e cortes clássicos executados na tesoura.', photo: IMG.matheus, rating: 4.97, completedCuts: 1105, workDays: [2, 3, 4, 5, 6, 0], startHour: '09:00', endHour: '19:00', active: true }
    ],
    products: [
      { id: 'prod-1', name: 'Pomada Matte Black Gold 120g', description: 'Fixação alta com efeito seco natural e zero resíduos. Fragrância amadeirada exclusiva EDY-K.', category: 'Pomadas', price: 68, promoPrice: 54.9, stock: 14, image: IMG.pomade, active: true, featured: true },
      { id: 'prod-2', name: 'Óleo para Barba Elixir Âmbar 30ml', description: 'Blend nutritivo de argan, jojoba e cedro. Alinha, perfuma e elimina o ressecamento dos fios da barba.', category: 'Óleos para Barba', price: 59.9, stock: 9, image: IMG.oil, active: true, featured: true },
      { id: 'prod-3', name: 'Shampoo Detox Carvão & Mentol 250ml', description: 'Limpeza profunda para cabelo e barba com sensação refrescante imediata e controle de oleosidade.', category: 'Shampoos', price: 49.9, promoPrice: 42.9, stock: 18, image: IMG.shampoo, active: true, featured: true },
      { id: 'prod-4', name: 'Kit Executivo EDY-K Signature', description: 'Caixa rígida colecionável com Pomada Matte, Óleo Elixir, Pente de Madeira Nobre e Navalhete Dourado.', category: 'Kits', price: 219, promoPrice: 179.9, stock: 5, image: IMG.kit, active: true, featured: true },
      { id: 'prod-5', name: 'Pomada Teia Efeito Brilho 100g', description: 'Modelagem flexível com fibras elásticas ideal para topetes estruturados e penteados clássicos.', category: 'Pomadas', price: 62, stock: 11, image: IMG.pomade, active: true },
      { id: 'prod-6', name: 'Óleo Reserve Sandalo & Oud 30ml', description: 'Notas sofisticadas de sândalo e especiarias com toque seco de absorção rápida para barbas longas.', category: 'Óleos para Barba', price: 69.9, stock: 3, image: IMG.oil, active: true },
      { id: 'prod-7', name: 'Shampoo Hidratante Barba Macia 250ml', description: 'Fórmula suave com pantenol e extrato de cevada que amacia fios grossos desde a primeira lavagem.', category: 'Shampoos', price: 52, stock: 12, image: IMG.shampoo, active: true },
      { id: 'prod-8', name: 'Kit Essencial Dia a Dia', description: 'Combinação prática de Shampoo Detox 250ml + Pomada Matte Black Gold com desconto especial.', category: 'Kits', price: 115, promoPrice: 92, stock: 7, image: IMG.kit, active: true }
    ],
    settings: {
      shopName: 'EDY-K Barbershop',
      tagline: 'Estilo, precisão e tradição no detalhe',
      phone: '(11) 98254-1469',
      whatsappUrl: 'https://wa.me/message/X5EVZRC2S7CYE1',
      instagramHandle: '@barbearia_edyk',
      address: 'R. Juiz de Fora, 279 - , 03286-000',
      neighborhood: 'Vila Ema, São Paulo - SP',
      topNoticeEnabled: true,
      topNoticeText: 'Horários de Sexta e Sábado esgotando rápido — garanta seu corte online com pagamento via Pix.',
      customLogoUrl: '',
      deliveryFee: 14.9,
      freeDeliveryThreshold: 150,
      schedule: [
        { dayIndex: 1, dayLabel: 'Segunda-feira', shortLabel: 'Seg', open: '10:00', close: '20:00', closed: false },
        { dayIndex: 2, dayLabel: 'Terça-feira', shortLabel: 'Ter', open: '09:00', close: '20:00', closed: false },
        { dayIndex: 3, dayLabel: 'Quarta-feira', shortLabel: 'Qua', open: '09:00', close: '20:00', closed: false },
        { dayIndex: 4, dayLabel: 'Quinta-feira', shortLabel: 'Qui', open: '09:00', close: '20:00', closed: false },
        { dayIndex: 5, dayLabel: 'Sexta-feira', shortLabel: 'Sex', open: '09:00', close: '21:00', closed: false },
        { dayIndex: 6, dayLabel: 'Sábado', shortLabel: 'Sáb', open: '09:00', close: '19:00', closed: false },
        { dayIndex: 0, dayLabel: 'Domingo', shortLabel: 'Dom', open: '09:00', close: '14:00', closed: true }
      ]
    },
    appointments: [
      { id: 'apt-101', userId: 'user-demo-client', clientName: 'Lucas Ferreira', clientPhone: '(11) 97412-8830', serviceId: 'srv-2', serviceName: 'Combo Corte + Barba', servicePrice: 90, serviceDuration: 70, barberId: 'barber-1', barberName: 'Edy Oliveira', date: iso(1), time: '15:00', status: 'confirmed', paymentMethod: 'pix', paymentStatus: 'paid', createdAt: iso(-1) },
      { id: 'apt-102', userId: 'user-client-2', clientName: 'Matheus Almeida', clientPhone: '(11) 96521-4410', serviceId: 'srv-1', serviceName: 'Corte Degradê (Fade)', servicePrice: 55, serviceDuration: 40, barberId: 'barber-1', barberName: 'Edy Oliveira', date: iso(0), time: '11:00', status: 'confirmed', paymentMethod: 'pix', paymentStatus: 'paid', createdAt: iso(-2) },
      { id: 'apt-103', userId: 'user-client-3', clientName: 'Gabriel Costa', clientPhone: '(11) 98104-2291', serviceId: 'srv-3', serviceName: 'Barba na Navalha', servicePrice: 45, serviceDuration: 35, barberId: 'barber-3', barberName: 'Ricardo Silva', date: iso(0), time: '14:00', status: 'pending', paymentMethod: 'in_shop', paymentStatus: 'pending', createdAt: iso(-1) },
      { id: 'apt-104', userId: 'user-client-4', clientName: 'Thiago Nogueira', clientPhone: '(11) 99315-7704', serviceId: 'srv-2', serviceName: 'Combo Corte + Barba', servicePrice: 90, serviceDuration: 70, barberId: 'barber-2', barberName: 'Kauê Mendes', date: iso(0), time: '16:30', status: 'confirmed', paymentMethod: 'credit_card', paymentStatus: 'paid', installments: 2, createdAt: iso(-1) },
      { id: 'apt-105', userId: 'user-demo-client', clientName: 'Lucas Ferreira', clientPhone: '(11) 97412-8830', serviceId: 'srv-1', serviceName: 'Corte Degradê (Fade)', servicePrice: 55, serviceDuration: 40, barberId: 'barber-2', barberName: 'Kauê Mendes', date: iso(-4), time: '18:00', status: 'completed', paymentMethod: 'pix', paymentStatus: 'paid', createdAt: iso(-6) },
      { id: 'apt-106', userId: 'user-client-2', clientName: 'Matheus Almeida', clientPhone: '(11) 96521-4410', serviceId: 'srv-4', serviceName: 'Corte Social na Tesoura', servicePrice: 60, serviceDuration: 45, barberId: 'barber-3', barberName: 'Ricardo Silva', date: iso(-2), time: '10:30', status: 'completed', paymentMethod: 'credit_card', paymentStatus: 'paid', createdAt: iso(-3) },
      { id: 'apt-107', userId: 'user-client-3', clientName: 'Gabriel Costa', clientPhone: '(11) 98104-2291', serviceId: 'srv-2', serviceName: 'Combo Corte + Barba', servicePrice: 90, serviceDuration: 70, barberId: 'barber-1', barberName: 'Edy Oliveira', date: iso(-1), time: '17:00', status: 'completed', paymentMethod: 'pix', paymentStatus: 'paid', createdAt: iso(-3) },
      { id: 'apt-108', userId: 'user-client-4', clientName: 'Thiago Nogueira', clientPhone: '(11) 99315-7704', serviceId: 'srv-1', serviceName: 'Corte Degradê (Fade)', servicePrice: 55, serviceDuration: 40, barberId: 'barber-2', barberName: 'Kauê Mendes', date: iso(-3), time: '15:30', status: 'completed', paymentMethod: 'pix', paymentStatus: 'paid', createdAt: iso(-5) },
      { id: 'apt-109', userId: 'user-client-2', clientName: 'Matheus Almeida', clientPhone: '(11) 96521-4410', serviceId: 'srv-2', serviceName: 'Combo Corte + Barba', servicePrice: 90, serviceDuration: 70, barberId: 'barber-1', barberName: 'Edy Oliveira', date: iso(-5), time: '13:00', status: 'completed', paymentMethod: 'credit_card', paymentStatus: 'paid', createdAt: iso(-7) }
    ],
    orders: [
      { id: 'ord-501', userId: 'user-demo-client', clientName: 'Lucas Ferreira', clientPhone: '(11) 97412-8830', items: [{ productId: 'prod-1', name: 'Pomada Matte Black Gold 120g', price: 54.9, quantity: 1, image: IMG.pomade }, { productId: 'prod-2', name: 'Óleo para Barba Elixir Âmbar 30ml', price: 59.9, quantity: 1, image: IMG.oil }], subtotal: 114.8, deliveryFee: 0, total: 114.8, fulfillment: 'pickup', paymentMethod: 'pix', paymentStatus: 'paid', status: 'ready', createdAt: iso(-1) },
      { id: 'ord-502', userId: 'user-client-3', clientName: 'Gabriel Costa', clientPhone: '(11) 98104-2291', items: [{ productId: 'prod-4', name: 'Kit Executivo EDY-K Signature', price: 179.9, quantity: 1, image: IMG.kit }], subtotal: 179.9, deliveryFee: 0, total: 179.9, fulfillment: 'delivery', deliveryAddress: 'R. Juiz de Fora, 279', paymentMethod: 'credit_card', paymentStatus: 'paid', installments: 3, status: 'delivered', createdAt: iso(-3) },
      { id: 'ord-503', userId: 'user-client-4', clientName: 'Thiago Nogueira', clientPhone: '(11) 99315-7704', items: [{ productId: 'prod-3', name: 'Shampoo Detox Carvão & Mentol 250ml', price: 42.9, quantity: 2, image: IMG.shampoo }], subtotal: 85.8, deliveryFee: 0, total: 85.8, fulfillment: 'pickup', paymentMethod: 'pix', paymentStatus: 'paid', status: 'delivered', createdAt: iso(-5) }
    ],
    reviews: [
      { id: 'rev-1', appointmentId: 'apt-107', userId: 'user-client-3', clientName: 'Gabriel Costa', barberId: 'barber-1', barberName: 'Edy Oliveira', serviceId: 'srv-2', serviceName: 'Combo Corte + Barba', serviceRating: 5, barberRating: 5, comment: '"Qualidade existe quando há atenção aos mínimos detalhes."', status: 'approved', createdAt: iso(-1) },
      { id: 'rev-2', appointmentId: 'apt-108', userId: 'user-client-4', clientName: 'Thiago Nogueira', barberId: 'barber-2', barberName: 'Kauê Mendes', serviceId: 'srv-1', serviceName: 'Corte Degradê (Fade)', serviceRating: 5, barberRating: 5, comment: 'O Edy manda muito bem no low fade e no acabamento. Ambiente top e atendimento rápido.', status: 'approved', createdAt: iso(-3) },
      { id: 'rev-3', appointmentId: 'apt-106', userId: 'user-client-2', clientName: 'Matheus Almeida', barberId: 'barber-3', barberName: 'Ricardo Silva', serviceId: 'srv-4', serviceName: 'Corte Social na Tesoura', serviceRating: 5, barberRating: 5, comment: 'Corte todo na tesoura muito bem alinhado, respeitou o caimento natural do cabelo. Recomendo demais.', status: 'approved', createdAt: iso(-2) },
      { id: 'rev-4', appointmentId: 'apt-109', userId: 'user-client-2', clientName: 'Matheus Almeida', barberId: 'barber-1', barberName: 'Edy Oliveira', serviceId: 'srv-2', serviceName: 'Combo Corte + Barba', serviceRating: 5, barberRating: 5, comment: 'Sempre saio satisfeito. Agendei pelo app, paguei no Pix e não esperei nem 2 minutos.', status: 'approved', createdAt: iso(-5) }
    ],
    loyaltyConfig: { enabled: true, pointsPerRealService: 2, bookingBonusPoints: 25, pointsPerRealProduct: 1, productBonusPoints: 15 },
    rewards: [
      { id: 'rew-1', title: 'Desconto de R$ 15 em Serviços', description: 'Válido para qualquer corte, barba ou combo agendado pelo app.', pointsCost: 150, discountAmount: 15, appliesTo: 'service', active: true },
      { id: 'rew-2', title: 'R$ 20 OFF na Loja EDY-K', description: 'Use na compra de pomadas, óleos para barba, shampoos ou kits.', pointsCost: 180, discountAmount: 20, appliesTo: 'product', active: true },
      { id: 'rew-3', title: 'Desconto VIP de R$ 35', description: 'Benefício flexível válido tanto para serviços na cadeira quanto produtos.', pointsCost: 320, discountAmount: 35, appliesTo: 'both', active: true },
      { id: 'rew-4', title: 'Combo Corte + Barba (R$ 50 OFF)', description: 'Recompensa máxima para clientes frequentes da Barbearia Edyk.', pointsCost: 500, discountAmount: 50, appliesTo: 'service', active: true }
    ],
    redeemedRewards: [
      { id: 'red-1', code: 'EDYK-VIP15', userId: 'user-demo-client', rewardId: 'rew-1', rewardTitle: 'Desconto de R$ 15 em Serviços', discountAmount: 15, appliesTo: 'service', pointsSpent: 150, status: 'available', redeemedAt: iso(-2) }
    ],
    pointTransactions: [
      { id: 'ptx-1', userId: 'user-demo-client', type: 'earn', points: 135, description: 'Agendamento: Corte Degradê (Fade)', referenceId: 'apt-105', createdAt: iso(-4) },
      { id: 'ptx-2', userId: 'user-demo-client', type: 'earn', points: 205, description: 'Agendamento: Combo Corte + Barba', referenceId: 'apt-101', createdAt: iso(-1) },
      { id: 'ptx-3', userId: 'user-demo-client', type: 'earn', points: 130, description: 'Compra na Loja #ORD-501 (Pomada + Óleo)', referenceId: 'ord-501', createdAt: iso(-1) },
      { id: 'ptx-4', userId: 'user-demo-client', type: 'redeem', points: -150, description: 'Resgate: Desconto de R$ 15 em Serviços', referenceId: 'red-1', createdAt: iso(-2) }
    ],
    cart: [],
    currentUser: null
  };

  /* ==========================================================
   * 2. Utilitários
   * ========================================================== */
  var KEY = 'edyk_v1_';
  var DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  var nf = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function money(v) { return nf.format(Number(v) || 0); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(KEY + key);
      if (!raw) return clone(fallback);
      var parsed = JSON.parse(raw);
      return parsed == null ? clone(fallback) : parsed;
    } catch (e) { return clone(fallback); }
  }
  function uid(prefix) { return prefix + '-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10); }
  function dow(s) { var a = String(s).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]).getDay(); }
  function fmtDate(s) {
    var a = String(s).split('-').map(Number);
    if (!a[0] || !a[1] || !a[2]) return String(s);
    return DAYS[dow(s)] + ', ' + pad(a[2]) + ' ' + MONTHS[a[1] - 1];
  }
  function fmtFull(s) { var a = String(s).split('-').map(Number); return pad(a[2]) + '/' + pad(a[1]) + '/' + a[0]; }
  function slots(start, end) {
    var a = start.split(':').map(Number), b = end.split(':').map(Number);
    if (isNaN(a[0]) || isNaN(b[0])) return [];
    var out = [], t = a[0] * 60 + (a[1] || 0), last = b[0] * 60 + (b[1] || 0);
    for (; t < last; t += 30) out.push(pad(Math.floor(t / 60)) + ':' + pad(t % 60));
    return out;
  }
  function maskPhone(v) {
    var d = String(v).replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function maskCard(v) { return String(v).replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); }
  function maskExpiry(v) { var d = String(v).replace(/\D/g, '').slice(0, 4); return d.length <= 2 ? d : d.slice(0, 2) + '/' + d.slice(2); }

  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m9 14-1.5 7L12 18l4.5 3L15 14"/>',
    logout: '<path d="M10 4H5v16h5"/><path d="M15 8l4 4-4 4M19 12H9"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.4 8.2 8 9 4.6-.8 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a13 13 0 0 0 6 6L16 13l5 2v4c0 1-1 2-2 2A17 17 0 0 1 3 5c0-1 1-2 2-2Z"/>',
    pin: '<path d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    arrow: '<path d="M4 12h15M14 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20V8"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3.9a7 7 0 0 0-1.7-1L14.5 3h-4L10 5.9a7 7 0 0 0-1.7 1L6 6l-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.3-.9a7 7 0 0 0 1.7 1l.5 2.9h4l.5-2.9a7 7 0 0 0 1.7-1l2.3.9 2-3.5-2-1.5a7 7 0 0 0 .1-1Z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 5v6h-6"/>'
  };
  function ic(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  function logo(size) {
    var custom = state.settings.customLogoUrl;
    if (custom && /^https?:\/\//i.test(custom)) {
      return '<span style="position:relative;display:inline-flex">' +
        '<img src="' + esc(custom) + '" alt="EDY-K" width="' + size + '" height="' + size + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;border:1px solid var(--gold)" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">' +
        '<svg style="display:none;width:' + size + 'px;height:' + size + 'px"><use href="#edyk-logo"/></svg></span>';
    }
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 200 200" aria-label="Emblema EDY-K"><use href="#edyk-logo"/></svg>';
  }

  /* ==========================================================
   * 3. Estado
   * ========================================================== */
  var state = {};
  Object.keys(SEED).forEach(function (k) { state[k] = load(k, SEED[k]); });

  var ui = {
    view: 'home', cartOpen: false, cartTab: 'cart', noticeDismissed: false,
    shopCat: 'Todos', aptTab: 'upcoming', authTab: 'login', adminTab: 'dashboard',
    adminForm: null, reviewFor: null, adminDate: iso(0), toasts: [], sbTest: null,
    booking: { step: 1, serviceId: '', barberId: '', date: '', time: '', reschedule: null, confirmed: null, payment: 'pix', rewardId: '', name: '', phone: '', installments: 1 }
  };

  var apiAvailable = false, apiTimer = null;

  /* ==========================================================
   * 3b. Supabase via REST (sem dependências / sem npm)
   *     Apenas users e products são remotos; o resto segue no localStorage.
   * ========================================================== */
  var SB_CONFIG_KEY = 'edyk_supabase_config';
  var sb = { ok: false, checked: false, error: '' };

  function sbConfig() {
    var file = window.EDYK_SUPABASE || {};
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(SB_CONFIG_KEY) || '{}') || {}; } catch (e) { /* ignore */ }
    /* O valor salvo no painel admin tem prioridade, inclusive quando vazio
     * (assim é possível limpar uma configuração antiga sem editar config.js). */
    var hasUrl = Object.prototype.hasOwnProperty.call(saved, 'url');
    var hasKey = Object.prototype.hasOwnProperty.call(saved, 'anonKey');
    return {
      url: String(hasUrl ? saved.url : (file.url || '')).trim().replace(/\/+$/, ''),
      anonKey: String(hasKey ? saved.anonKey : (file.anonKey || '')).trim()
    };
  }
  function sbReady() { var c = sbConfig(); return !!(c.url && c.anonKey); }
  function sbRequest(table, method, query, body) {
    var c = sbConfig();
    if (!c.url || !c.anonKey) return Promise.reject(new Error('Supabase não configurado'));
    return fetch(c.url + '/rest/v1/' + table + (query || ''), {
      method: method,
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation,resolution=merge-duplicates' : 'return=representation'
      },
      body: body == null ? undefined : JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ': ' + String(t).slice(0, 180)); });
      }
      return r.status === 204 ? null : r.json();
    });
  }

  function userToRow(u) {
    return { id: u.id, name: u.name, email: u.email, phone: u.phone || '', password: u.password || '', role: u.role || 'client', created_at: u.createdAt || iso(0) };
  }
  function rowToUser(r) {
    return { id: r.id, name: r.name, email: r.email, phone: r.phone || '', password: r.password || '', role: r.role || 'client', createdAt: r.created_at || iso(0) };
  }
  function productToRow(p) {
    return { id: p.id, name: p.name, description: p.description || '', category: p.category || '', price: Number(p.price) || 0, promo_price: p.promoPrice == null ? null : Number(p.promoPrice), stock: Number(p.stock) || 0, image: p.image || '', active: !!p.active, featured: !!p.featured };
  }
  function rowToProduct(r) {
    var p = { id: r.id, name: r.name, description: r.description || '', category: r.category || '', price: Number(r.price) || 0, stock: Number(r.stock) || 0, image: r.image || '', active: r.active !== false, featured: !!r.featured };
    if (r.promo_price != null) p.promoPrice = Number(r.promo_price);
    return p;
  }

  function sbUpsert(kind, item) {
    if (!sbReady()) return Promise.resolve(false);
    var table = kind === 'users' ? 'users' : 'products';
    var row = kind === 'users' ? userToRow(item) : productToRow(item);
    return sbRequest(table, 'POST', '?on_conflict=id', row)
      .then(function () { sb.ok = true; sb.error = ''; return true; })
      .catch(function (e) { sb.ok = false; sb.error = e.message; notify('Falha ao salvar no Supabase (' + kind + '): ' + e.message, 'error'); return false; });
  }
  function sbRemove(kind, id) {
    if (!sbReady()) return Promise.resolve(false);
    return sbRequest(kind === 'users' ? 'users' : 'products', 'DELETE', '?id=eq.' + encodeURIComponent(id))
      .then(function () { sb.ok = true; sb.error = ''; return true; })
      .catch(function (e) { sb.ok = false; sb.error = e.message; notify('Falha ao excluir no Supabase (' + kind + '): ' + e.message, 'error'); return false; });
  }
  function sbLoad() {
    if (!sbReady()) { sb.checked = false; renderView(); return Promise.resolve(false); }
    var before = sb.checked + ':' + sb.ok;
    function refreshStatus() { if (before !== sb.checked + ':' + sb.ok) renderView(); }
    return Promise.all([
      sbRequest('users', 'GET', '?select=*'),
      sbRequest('products', 'GET', '?select=*')
    ]).then(function (res) {
      sb.ok = true; sb.checked = true; sb.error = '';
      var changed = false;
      if (Array.isArray(res[0]) && res[0].length) { state.users = res[0].map(rowToUser); changed = true; }
      if (Array.isArray(res[1]) && res[1].length) { state.products = res[1].map(rowToProduct); changed = true; }
      if (changed) {
        if (state.currentUser) {
          state.currentUser = state.users.find(function (u) { return u.id === state.currentUser.id; }) || null;
        }
        persist(); render();
      } else refreshStatus();
      return true;
    }).catch(function (e) {
      sb.ok = false; sb.checked = true; sb.error = e.message;
      refreshStatus();
      return false;
    });
  }
  function sbPublishSeed() {
    if (!sbReady()) { notify('Configure a URL e a chave anon antes.', 'error'); return; }
    Promise.all([
      sbRequest('users', 'POST', '?on_conflict=id', SEED.users.map(userToRow)),
      sbRequest('products', 'POST', '?on_conflict=id', SEED.products.map(productToRow))
    ]).then(function () {
      sb.ok = true; sb.error = '';
      notify('Dados iniciais publicados no Supabase.');
      return sbLoad();
    }).catch(function (e) { sb.ok = false; sb.error = e.message; notify('Falha ao publicar: ' + e.message, 'error'); });
  }
  function sbSelfTest() {
    if (!sbReady()) { notify('Configure a URL e a chave anon antes.', 'error'); return; }
    var stamp = Date.now().toString().slice(-7) + Math.floor(Math.random() * 90 + 10);
    var u = { id: 'test-user-' + stamp, name: 'Teste EDY-K', email: 'teste.' + stamp + '@edyk.test', phone: '(11) 90000-0000', password: '123456', role: 'client', createdAt: iso(0) };
    var p = { id: 'test-prod-' + stamp, name: 'Produto Teste EDY-K', description: 'Registro temporário criado pelo teste', category: 'Kits', price: 10, stock: 1, image: 'assets/images/product-kit.jpg', active: true, featured: false };
    var steps = [];
    ui.sbTest = { running: true, ok: false, steps: steps };
    renderView();

    function step(text, ok) { steps.push({ text: text, ok: !!ok }); ui.sbTest.steps = steps.slice(); renderView(); }
    function del(table, id) { return sbRequest(table, 'DELETE', '?id=eq.' + encodeURIComponent(id)).catch(function () {}); }
    function gone(table, id) {
      return sbRequest(table, 'GET', '?select=id&id=eq.' + encodeURIComponent(id))
        .then(function (r) { return !Array.isArray(r) || r.length === 0; })
        .catch(function () { return false; });
    }
    function finish(ok, err) {
      if (err) step('Erro: ' + err, false);
      Promise.all([del('users', u.id), del('products', p.id)])
        .then(function () { return Promise.all([gone('users', u.id), gone('products', p.id)]); })
        .then(function (r) {
          var clean = r[0] && r[1];
          step('Excluir registros de teste', clean);
          ui.sbTest = { running: false, ok: ok && clean, steps: steps.slice() };
          sb.ok = sb.ok && ui.sbTest.ok;
          renderView();
          notify(ui.sbTest.ok ? 'Teste de insert/exclusão concluído com sucesso.' : 'Teste com falhas — veja os detalhes no painel.', ui.sbTest.ok ? 'success' : 'error');
        });
    }

    sbRequest('users', 'POST', '?on_conflict=id', userToRow(u))
      .then(function () { step('Inserir usuário de teste', true); return sbRequest('products', 'POST', '?on_conflict=id', productToRow(p)); })
      .then(function () { step('Inserir produto de teste', true); return sbRequest('users', 'GET', '?select=id&id=eq.' + encodeURIComponent(u.id)); })
      .then(function (r) { step('Consultar usuário inserido', Array.isArray(r) && r.length > 0); return sbRequest('products', 'GET', '?select=id&id=eq.' + encodeURIComponent(p.id)); })
      .then(function (r) { step('Consultar produto inserido', Array.isArray(r) && r.length > 0); finish(true); })
      .catch(function (e) { sb.ok = false; sb.error = e.message; finish(false, e.message); });
  }

  function persist() {
    Object.keys(SEED).forEach(function (k) {
      try { localStorage.setItem(KEY + k, JSON.stringify(state[k])); } catch (e) { /* storage cheio */ }
    });
    if (!apiAvailable) return;
    clearTimeout(apiTimer);
    apiTimer = setTimeout(function () {
      /* currentUser é sessão do navegador: não vai para o estado compartilhado. */
      var shared = {};
      Object.keys(SEED).forEach(function (k) { if (k !== 'currentUser') shared[k] = state[k]; });
      fetch('api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(shared) }).catch(function () {});
    }, 600);
  }

  function initRemote() {
    /* Supabase funciona em qualquer origem: file://, localhost ou Vercel. */
    sbLoad();

    /* A API Python de persistência só existe em localhost. */
    if (!/^https?:$/.test(location.protocol)) return;
    if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    fetch('api/state', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        apiAvailable = true;
        if (data && typeof data === 'object') {
          var changed = false;
          Object.keys(SEED).forEach(function (k) {
            if (k === 'currentUser') return; /* sessão permanece local ao navegador */
            if (data[k] !== undefined && JSON.stringify(data[k]) !== JSON.stringify(state[k])) { state[k] = data[k]; changed = true; }
          });
          if (changed) render();
        }
      })
      .catch(function () { apiAvailable = false; });
  }

  function notify(text, type) {
    var t = { id: uid('t'), text: text, type: type || 'success' };
    ui.toasts.push(t);
    renderToasts();
    setTimeout(function () { ui.toasts = ui.toasts.filter(function (x) { return x.id !== t.id; }); renderToasts(); }, 3400);
  }

  /* ==========================================================
   * 4. Regras de negócio
   * ========================================================== */
  function user() { return state.currentUser || null; }
  function isAdmin() { return !!user() && user().role === 'admin'; }
  function points(uidUser) {
    var id = uidUser || (user() && user().id);
    if (!id) return 0;
    return Math.max(0, state.pointTransactions.reduce(function (s, t) { return s + (t.userId === id ? Number(t.points) : 0); }, 0));
  }
  function cartCount() { return state.cart.reduce(function (s, i) { return s + i.quantity; }, 0); }
  function cartSubtotal() {
    return state.cart.reduce(function (s, i) {
      var p = state.products.find(function (x) { return x.id === i.productId; });
      return p ? s + (p.promoPrice != null ? p.promoPrice : p.price) * i.quantity : s;
    }, 0);
  }
  function servicePoints(price) {
    var c = state.loyaltyConfig;
    return c.enabled ? Math.max(0, Math.round(price * c.pointsPerRealService) + c.bookingBonusPoints) : 0;
  }
  function productPoints(subtotal) {
    var c = state.loyaltyConfig;
    return c.enabled ? Math.max(0, Math.round(subtotal * c.pointsPerRealProduct) + c.productBonusPoints) : 0;
  }
  function addTx(uidUser, type, pts, description, ref) {
    state.pointTransactions.unshift({ id: uid('ptx'), userId: uidUser, type: type, points: pts, description: description, referenceId: ref || '', createdAt: iso(0) });
  }
  function barberStats(id, fallback) {
    var list = state.reviews.filter(function (r) { return r.barberId === id && r.status === 'approved'; });
    if (!list.length) return { average: Number(fallback) || 0, count: 0 };
    return { average: Number((list.reduce(function (s, r) { return s + r.barberRating; }, 0) / list.length).toFixed(2)), count: list.length };
  }
  function isTaken(barberId, date, time, ignoreId) {
    return state.appointments.some(function (a) {
      return a.id !== ignoreId && a.barberId === barberId && a.date === date && a.time === time && a.status !== 'cancelled';
    });
  }
  function availableBarbers(date, time, ignoreId) {
    return state.barbers.filter(function (b) { return b.active && b.workDays.indexOf(dow(date)) >= 0 && !isTaken(b.id, date, time, ignoreId); });
  }
  function availableTimes(date, barberId) {
    var day = dow(date);
    if (barberId && barberId !== 'any') {
      var b = state.barbers.find(function (x) { return x.id === barberId && x.active; });
      if (!b || b.workDays.indexOf(day) < 0) return [];
      return slots(b.startHour, b.endHour).filter(function (t) { return !isTaken(b.id, date, t); });
    }
    var cfg = state.settings.schedule.find(function (d) { return d.dayIndex === day; });
    if (!cfg || cfg.closed) return [];
    var active = state.barbers.filter(function (b) { return b.active && b.workDays.indexOf(day) >= 0; });
    if (!active.length) return [];
    return slots(cfg.open, cfg.close).filter(function (t) {
      return active.some(function (b) { return !isTaken(b.id, date, t); });
    });
  }

  function login(email, password) {
    var found = state.users.find(function (u) { return u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password; });
    if (!found) return { ok: false, error: 'E-mail ou senha incorretos. Verifique seus dados ou use o acesso rápido.' };
    state.currentUser = found;
    persist();
    notify('Bem-vindo, ' + found.name.split(' ')[0] + '!');
    return { ok: true, user: found };
  }
  function register(data) {
    var email = String(data.email).trim().toLowerCase();
    if (state.users.some(function (u) { return u.email.toLowerCase() === email; })) return { ok: false, error: 'Já existe uma conta cadastrada com este e-mail.' };
    var u = { id: uid('user'), name: String(data.name).trim(), email: email, phone: maskPhone(data.phone), password: data.password, role: 'client', createdAt: iso(0) };
    state.users.push(u);
    state.currentUser = u;
    persist();
    sbUpsert('users', u);
    notify('Conta criada com sucesso! Seja bem-vindo à EDY-K.');
    return { ok: true, user: u };
  }
  function logout() { state.currentUser = null; persist(); notify('Você saiu da sua conta.', 'info'); }

  function addToCart(id, qty) {
    var p = state.products.find(function (x) { return x.id === id; });
    if (!p || p.stock <= 0) { notify('Produto sem estoque no momento.', 'error'); return; }
    var item = state.cart.find(function (i) { return i.productId === id; });
    if (item) item.quantity = Math.min(p.stock, item.quantity + (qty || 1));
    else state.cart.push({ productId: id, quantity: Math.min(p.stock, qty || 1) });
    persist();
    renderHeader(); renderCart();
    notify(p.name + ' adicionado ao carrinho.');
  }
  function setQty(id, delta) {
    var item = state.cart.find(function (i) { return i.productId === id; });
    if (!item) return;
    var p = state.products.find(function (x) { return x.id === id; });
    var next = item.quantity + delta;
    if (next <= 0) state.cart = state.cart.filter(function (i) { return i.productId !== id; });
    else item.quantity = p ? Math.min(p.stock, next) : next;
    persist(); renderHeader(); renderCart(); renderView();
  }
  function removeFromCart(id) { state.cart = state.cart.filter(function (i) { return i.productId !== id; }); persist(); renderHeader(); renderCart(); renderView(); }

  function createOrder(fd) {
    if (!state.cart.length) { notify('Seu carrinho está vazio.', 'error'); return; }
    var items = state.cart.map(function (i) {
      var p = state.products.find(function (x) { return x.id === i.productId; });
      return p ? { productId: p.id, name: p.name, price: p.promoPrice != null ? p.promoPrice : p.price, quantity: i.quantity, image: p.image } : null;
    }).filter(Boolean);
    var subtotal = items.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
    var reward = state.redeemedRewards.find(function (r) { return r.id === fd.get('rewardId') && r.status === 'available'; });
    var discount = reward ? Math.min(subtotal, reward.discountAmount) : 0;
    var discounted = Math.max(0, subtotal - discount);
    var fulfillment = fd.get('fulfillment') === 'delivery' ? 'delivery' : 'pickup';
    var fee = fulfillment === 'delivery' && subtotal < state.settings.freeDeliveryThreshold ? state.settings.deliveryFee : 0;
    if (fulfillment === 'delivery' && !String(fd.get('address') || '').trim()) { notify('Informe o endereço de entrega.', 'error'); return; }
    var method = fd.get('method') === 'credit_card' ? 'credit_card' : 'pix';
    var order = {
      id: uid('ord'), userId: user() ? user().id : 'guest',
      clientName: String(fd.get('name') || (user() && user().name) || 'Cliente Visitante').trim(),
      clientPhone: maskPhone(fd.get('phone') || (user() && user().phone) || ''),
      items: items, subtotal: subtotal, discountApplied: discount, appliedRewardId: reward ? reward.id : undefined,
      deliveryFee: fee, total: discounted + fee, fulfillment: fulfillment,
      deliveryAddress: fulfillment === 'delivery' ? String(fd.get('address')).trim() : undefined,
      paymentMethod: method, paymentStatus: 'paid', installments: method === 'credit_card' ? Number(fd.get('installments') || 1) : undefined,
      status: 'preparing', createdAt: iso(0)
    };
    if (reward) { reward.status = 'used'; reward.usedAt = iso(0); }
    items.forEach(function (i) {
      var p = state.products.find(function (x) { return x.id === i.productId; });
      if (p) { p.stock = Math.max(0, p.stock - i.quantity); sbUpsert('products', p); }
    });
    if (user() && state.loyaltyConfig.enabled) {
      var pts = productPoints(discounted);
      order.pointsEarned = pts;
      if (pts) addTx(user().id, 'earn', pts, 'Compra na Loja #' + order.id.toUpperCase(), order.id);
    }
    state.orders.unshift(order);
    state.cart = [];
    ui.cartOpen = false;
    ui.cartTab = 'cart';
    persist(); render();
    notify('Pedido ' + order.id.toUpperCase() + ' confirmado! Acompanhe em Meus Horários.', 'success');
  }

  function confirmBooking(fd) {
    var b = ui.booking, s = state.services.find(function (x) { return x.id === b.serviceId; });
    if (!s) { notify('Selecione um serviço.', 'error'); return; }
    if (!b.date || !b.time) { notify('Selecione data e horário.', 'error'); return; }
    var name = String(fd.get('name') || '').trim();
    var phone = maskPhone(fd.get('phone') || '');
    if (name.length < 3 || phone.replace(/\D/g, '').length < 10) { notify('Preencha nome e telefone corretamente.', 'error'); return; }
    var barber;
    if (b.barberId && b.barberId !== 'any') barber = state.barbers.find(function (x) { return x.id === b.barberId; });
    else barber = availableBarbers(b.date, b.time)[0];
    if (!barber) { notify('Desculpe, este horário não está mais disponível.', 'error'); return; }
    if (isTaken(barber.id, b.date, b.time, b.reschedule ? b.reschedule.id : null)) { notify('Horário já ocupado. Escolha outro.', 'error'); return; }
    var rewardId = fd.get('rewardId') || b.rewardId;
    var reward = state.redeemedRewards.find(function (r) { return r.id === rewardId && r.status === 'available'; });
    var discount = reward ? Math.min(s.price, reward.discountAmount) : 0;
    var method = fd.get('method') === 'credit_card' ? 'credit_card' : (fd.get('method') === 'in_shop' ? 'in_shop' : 'pix');
    var payload = {
      userId: user() ? user().id : 'guest', clientName: name, clientPhone: phone,
      serviceId: s.id, serviceName: s.name, servicePrice: Math.max(0, s.price - discount), originalPrice: s.price,
      discountApplied: discount, appliedRewardId: reward ? reward.id : undefined, serviceDuration: s.durationMinutes,
      barberId: barber.id, barberName: barber.name, date: b.date, time: b.time,
      status: method === 'in_shop' ? 'pending' : 'confirmed',
      paymentMethod: method, paymentStatus: method === 'in_shop' ? 'pending' : 'paid',
      installments: method === 'credit_card' ? Number(fd.get('installments') || 1) : undefined,
      notes: String(fd.get('notes') || '').trim(), createdAt: iso(0)
    };
    var earned;
    if (b.reschedule) {
      var old = state.appointments.find(function (a) { return a.id === b.reschedule.id; });
      if (old) { Object.keys(payload).forEach(function (k) { old[k] = payload[k]; }); }
      earned = old && old.pointsEarned ? old.pointsEarned : 0;
      notify('Agendamento remarcado com sucesso!');
    } else {
      earned = user() && user().role === 'client' ? servicePoints(s.price) : 0;
      payload.id = uid('apt');
      payload.pointsEarned = earned;
      state.appointments.unshift(payload);
      if (earned) addTx(payload.userId, 'earn', earned, 'Agendamento: ' + s.name, payload.id);
      notify('Agendamento confirmado! ' + fmtDate(b.date) + ' às ' + b.time);
    }
    if (reward) { reward.status = 'used'; reward.usedAt = iso(0); }
    b.confirmed = payload;
    b.step = 5;
    persist(); render();
  }

  function redeemReward(id) {
    if (!user()) { notify('Faça login para resgatar recompensas.', 'error'); nav('auth'); return; }
    var r = state.rewards.find(function (x) { return x.id === id && x.active; });
    if (!r) { notify('Recompensa não disponível no momento.', 'error'); return; }
    if (points() < r.pointsCost) { notify('Você precisa de ' + r.pointsCost + ' pontos para este resgate.', 'error'); return; }
    var code = 'EDYK-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    var red = { id: uid('red'), code: code, userId: user().id, rewardId: r.id, rewardTitle: r.title, discountAmount: r.discountAmount, appliesTo: r.appliesTo, pointsSpent: r.pointsCost, status: 'available', redeemedAt: iso(0) };
    state.redeemedRewards.unshift(red);
    addTx(user().id, 'redeem', -r.pointsCost, 'Resgate: ' + r.title, red.id);
    persist(); render();
    notify('Cupom ' + code + ' resgatado com sucesso!');
  }

  function setAppointmentStatus(id, status) {
    var a = state.appointments.find(function (x) { return x.id === id; });
    if (!a) return;
    if (status === 'cancelled' && a.status !== 'cancelled' && a.pointsEarned > 0) {
      addTx(a.userId, 'adjust', -a.pointsEarned, 'Estorno por cancelamento: ' + a.serviceName, a.id);
    }
    if (status === 'paid') {
      a.paymentStatus = 'paid';
      if (a.status === 'pending') a.status = 'confirmed';
    } else a.status = status;
    persist(); render();
    notify('Status do agendamento atualizado.', 'info');
  }

  function submitReview(fd, aptId) {
    var apt = state.appointments.find(function (a) { return a.id === aptId; });
    if (!apt) return;
    if (state.reviews.some(function (r) { return r.appointmentId === aptId; })) { notify('Você já avaliou este atendimento.', 'error'); return; }
    state.reviews.unshift({
      id: uid('rev'), appointmentId: aptId, userId: user() ? user().id : 'guest', clientName: user() ? user().name : apt.clientName,
      barberId: apt.barberId, barberName: apt.barberName, serviceId: apt.serviceId, serviceName: apt.serviceName,
      serviceRating: Number(fd.get('serviceRating')), barberRating: Number(fd.get('barberRating')),
      comment: String(fd.get('comment') || '').trim(), status: 'approved', createdAt: iso(0)
    });
    ui.reviewFor = null;
    persist(); render();
    notify('Avaliação publicada! Obrigado pelo feedback.');
  }

  function resetDemo() {
    Object.keys(SEED).forEach(function (k) { state[k] = clone(SEED[k]); });
    ui.booking = { step: 1, serviceId: '', barberId: '', date: '', time: '', reschedule: null, confirmed: null, payment: 'pix', rewardId: '', name: '', phone: '', installments: 1 };
    persist(); render();
    notify('Dados de demonstração restaurados.', 'info');
  }

  /* ==========================================================
   * 5. Render — estrutura e páginas públicas
   * ========================================================== */
  function stars(n) { return '<span class="stars">' + '★'.repeat(Math.max(0, Math.min(5, Number(n) || 0))) + '<span style="color:var(--border)">' + '★'.repeat(5 - Math.max(0, Math.min(5, Number(n) || 0))) + '</span></span>'; }
  function sectionHead(eyebrow, title, right) {
    return '<div class="section-head"><div><div class="eyebrow">' + eyebrow + '</div><h2>' + title + '</h2></div>' + (right || '') + '</div>';
  }
  function statusBadge(s) {
    var map = { pending: 'warn', confirmed: 'ok', completed: 'gold', cancelled: 'bad', preparing: 'warn', ready: 'ok', delivered: 'gold' };
    return '<span class="badge ' + (map[s] || '') + '">' + esc(s) + '</span>';
  }

  function renderNotice() {
    var el = document.getElementById('notice');
    var s = state.settings;
    if (!s.topNoticeEnabled || !s.topNoticeText || ui.noticeDismissed) { el.innerHTML = ''; el.classList.add('is-hidden'); return; }
    el.classList.remove('is-hidden');
    el.innerHTML = '<p>' + esc(s.topNoticeText) + '</p><button type="button" data-act="notice-close" aria-label="Fechar aviso">' + ic('x', 16) + '</button>';
  }

  function renderHeader() {
    var u = user(), n = cartCount();
    var links = [['home', 'Início'], ['booking', 'Agendar'], ['shop', 'Loja'], ['appointments', 'Meus Horários'], ['rewards', 'Meus Prêmios']];
    var nav = links.map(function (l) {
      return '<button class="nav-link' + (ui.view === l[0] ? ' active' : '') + '" data-act="nav" data-view="' + l[0] + '">' + l[1] + '</button>';
    }).join('');
    if (isAdmin()) nav += '<button class="nav-link admin" data-act="nav" data-view="admin">Painel Admin</button>';
    var account = u
      ? '<div class="row"><button class="btn" data-act="logout" title="Sair da conta">' + esc(u.name.split(' ')[0]) + ' ' + ic('logout', 14) + '</button></div>'
      : '<button class="btn btn-primary" data-act="nav" data-view="auth">' + ic('user', 14) + ' Entrar</button>';
    document.getElementById('header').innerHTML =
      '<div class="header-inner">' +
        '<button class="brand" data-act="nav" data-view="home">' + logo(42) + '<span>EDY-K</span></button>' +
        '<nav class="main-nav">' + nav + '</nav>' +
        '<div class="header-actions">' +
          '<button class="icon-btn" data-act="cart-open" aria-label="Abrir carrinho com ' + n + ' itens">' + ic('bag', 18) + (n ? '<span class="gold mono small">' + n + '</span>' : '') + '</button>' +
          account +
        '</div>' +
      '</div>';
  }

  function renderFooter() {
    var s = state.settings;
    document.getElementById('footer').innerHTML =
      '<div class="container row-between wrap" style="align-items:flex-start">' +
        '<div class="row" style="align-items:flex-start">' + logo(46) +
          '<div><div class="display" style="font-size:18px">' + esc(s.shopName) + '</div><div class="small muted">' + esc(s.address) + ' · ' + esc(s.neighborhood) + '</div></div>' +
        '</div>' +
        '<div class="row wrap">' +
          '<a class="btn btn-sm" href="https://instagram.com/' + esc(s.instagramHandle.replace(/^@/, '')) + '" target="_blank" rel="noopener noreferrer">' + ic('instagram', 14) + ' ' + esc(s.instagramHandle) + '</a>' +
          '<button class="btn btn-sm" data-act="nav" data-view="admin">' + ic('shield', 14) + ' Painel Admin</button>' +
        '</div>' +
      '</div>';
    document.getElementById('whatsapp').href = s.whatsappUrl;
  }

  function renderMobileNav() {
    var items = [['home', 'Início', 'home'], ['booking', 'Agendar', 'calendar'], ['shop', 'Loja', 'bag'], ['appointments', 'Horários', 'user'], ['rewards', 'Prêmios', 'award']];
    document.getElementById('mobile-nav').innerHTML = '<div>' + items.map(function (i) {
      return '<button class="' + (ui.view === i[0] ? 'active' : '') + '" data-act="nav" data-view="' + i[0] + '">' + ic(i[2], 20) + '<span>' + i[1] + '</span></button>';
    }).join('') + '</div>';
  }

  function viewHome() {
    var s = state.settings;
    var services = state.services.filter(function (x) { return x.active; });
    var barbers = state.barbers.filter(function (x) { return x.active; });
    var products = state.products.filter(function (x) { return x.active; }).slice(0, 4);
    var reviews = state.reviews.filter(function (x) { return x.status === 'approved'; }).slice(0, 6);
    var avg = reviews.length ? (reviews.reduce(function (a, r) { return a + (r.barberRating + r.serviceRating) / 2; }, 0) / reviews.length).toFixed(2) : '4.97';
    var today = s.schedule.find(function (d) { return d.dayIndex === new Date().getDay(); });
    var h = '<div class="hero"><div class="hero-bg"><img src="' + IMG.hero + '" alt="Interior da EDY-K Barbershop"></div><div class="hero-content"><div class="hero-copy">' +
      '<div class="eyebrow">' + esc(s.shopName) + ' · ' + esc(s.neighborhood) + '</div>' +
      '<h1>"Qualidade existe quando há atenção aos mínimos detalhes."</h1>' +
      '<p class="lead">Reserve seu horário em menos de 1 minuto com nosso APP. Pague via Pix, cartão ou após o corte.</p>' +
      '<div class="hero-cta"><button class="btn btn-primary btn-lg" data-act="book-start">' + ic('calendar', 18) + ' Agende Seu Horário</button>' +
      '<button class="btn btn-lg" data-act="nav" data-view="shop">' + ic('bag', 18) + ' Explorar Loja EDY-K</button></div></div>' +
      '<div class="proof">' +
        '<div><strong>' + avg + ' ★</strong><span>Avaliação média dos clientes</span></div>' +
        '<div><strong class="white">+3.400</strong><span>Atendimentos realizados</span></div>' +
        '<div><strong class="white">' + (today && !today.closed ? esc(today.open + ' – ' + today.close) : 'Fechado') + '</strong><span>Funcionamento hoje (' + (today ? today.shortLabel : '') + ')</span></div>' +
        '<div><strong class="white">Pix &amp; Cartão</strong><span>Pagamento online ou na barbearia</span></div>' +
      '</div></div></div>';

    h += '<section class="section container">' + sectionHead('Menu de Serviços', 'Rituais & Valores', '<button class="link-btn" data-act="book-start">Ver agenda disponível ' + ic('arrow', 15) + '</button>') +
      '<div class="grid grid-3">' + services.map(function (srv) {
        return '<article class="card card-hover service-card"><div><div class="row-between"><div><div class="service-meta">' + esc(srv.category) + ' · ' + srv.durationMinutes + ' min</div><h3>' + esc(srv.name) + '</h3></div><div class="mono gold" style="font-size:18px;font-weight:700">' + money(srv.price) + '</div></div><p>' + esc(srv.description) + '</p></div>' +
          '<button class="btn btn-block mt-2" data-act="book-start" data-service="' + srv.id + '">Agendar este serviço</button></article>';
      }).join('') + '</div></section>';

    h += '<section class="section container">' + sectionHead('Profissionais', 'Elenco EDY-K', '<p class="muted small" style="max-width:380px">Escolha seu barbeiro de confiança ou deixe sem preferência para ver todos os horários livres.</p>') +
      '<div class="grid grid-3">' + barbers.map(function (b) {
        var st = barberStats(b.id, b.rating);
        return '<article class="card barber-card"><div class="barber-photo"><img src="' + esc(b.photo) + '" alt="Barbeiro ' + esc(b.name) + '"><div class="barber-info"><div class="small gold">★ ' + st.average.toFixed(2) + ' <span class="muted">· ' + (st.count ? st.count + ' avaliações' : b.completedCuts + ' cortes') + '</span></div><h3>' + esc(b.name) + '</h3><div class="small gold">' + esc(b.specialty) + '</div></div></div>' +
          '<div class="barber-body"><p>' + esc(b.bio) + '</p><div class="row-between small muted mt-2"><span>' + b.workDays.map(function (d) { return DAYS[d]; }).join(', ') + '</span><span class="mono">' + esc(b.startHour) + '–' + esc(b.endHour) + '</span></div>' +
          '<button class="btn btn-block mt-2" data-act="book-start" data-barber="' + b.id + '">Agendar com ' + esc(b.name.split(' ')[0]) + '</button></div></article>';
      }).join('') + '</div></section>';

    if (reviews.length) {
      h += '<section class="section container">' + sectionHead('Experiência Real', 'Avaliações Recentes', '<p class="muted small">Nota média <strong class="gold">' + avg + ' ★</strong> verificada após atendimentos concluídos.</p>') +
        '<div class="grid grid-3">' + reviews.map(function (r) {
          return '<article class="card review-card"><div class="row-between"><div>' + stars(Math.round((r.barberRating + r.serviceRating) / 2)) + '</div><span class="small muted">' + fmtDate(r.createdAt) + '</span></div><p class="mt-2">"' + esc(r.comment) + '"</p><div class="divider"></div><div class="row-between small"><strong>' + esc(r.clientName) + '</strong><span class="gold mono">Serviço ' + r.serviceRating + '★ · Barbeiro ' + r.barberRating + '★</span></div><div class="small muted mt-1">' + esc(r.serviceName) + ' · com ' + esc(r.barberName) + '</div></article>';
        }).join('') + '</div></section>';
    }

    h += '<section class="section container">' + sectionHead('Grooming Oficial', 'Loja de Produtos', '<button class="link-btn" data-act="nav" data-view="shop">Ver catálogo completo ' + ic('arrow', 15) + '</button>') +
      '<div class="grid grid-4">' + products.map(function (p) {
        var price = p.promoPrice != null ? p.promoPrice : p.price, out = p.stock <= 0;
        return '<article class="card product-card"><div class="product-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></div><div class="product-body"><div><div class="small muted mb-1">' + esc(p.category) + ' · ' + (out ? '<span style="color:var(--danger)">Esgotado</span>' : p.stock + ' em estoque') + '</div><h3>' + esc(p.name) + '</h3></div>' +
          '<div class="row-between mt-3"><div>' + (p.promoPrice != null ? '<div class="price-old">' + money(p.price) + '</div>' : '') + '<div class="price mono">' + money(price) + '</div></div>' +
          '<button class="btn btn-sm" ' + (out ? 'disabled' : '') + ' data-act="add-cart" data-id="' + p.id + '">' + (out ? 'Indisponível' : 'Adicionar') + '</button></div></div></article>';
      }).join('') + '</div></section>';

    h += '<section class="section container"><div class="panel info-panel"><div class="panel-pad info-schedule">' +
      '<div class="eyebrow">' + ic('clock', 15) + ' Horário e Atendimento</div><h2>Quando Estamos Abertos</h2><p class="muted small">Atendimento com hora marcada e encaixes sujeitos à disponibilidade da cadeira.</p><div class="schedule-list mt-3">' +
      s.schedule.map(function (d) { return '<div class="' + (d.dayIndex === new Date().getDay() ? 'today' : '') + '"><span>' + esc(d.dayLabel) + (d.dayIndex === new Date().getDay() ? ' (Hoje)' : '') + '</span><span class="mono">' + (d.closed ? 'Fechado' : esc(d.open + ' – ' + d.close)) + '</span></div>'; }).join('') +
      '</div></div><div class="panel-pad info-contact"><div class="eyebrow">Localização & Contato</div><h3>Visite a Barbearia Edyk</h3>' +
      '<div class="info-contact-list"><div class="row"><span class="gold">' + ic('pin', 18) + '</span><div><div>' + esc(s.address) + '</div><div class="muted">' + esc(s.neighborhood) + '</div></div></div>' +
      '<div class="row"><span class="gold">' + ic('phone', 18) + '</span><span class="mono">' + esc(s.phone) + '</span></div>' +
      '<div class="row"><span class="gold">' + ic('instagram', 18) + '</span><a href="https://instagram.com/' + esc(s.instagramHandle.replace(/^@/, '')) + '" target="_blank" rel="noopener noreferrer">' + esc(s.instagramHandle) + '</a></div></div>' +
      '<div class="info-actions"><a class="btn btn-primary btn-lg btn-block btn-whatsapp" href="' + esc(s.whatsappUrl) + '" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>' +
      '<button class="btn btn-lg btn-block" data-act="book-start">Agendar Horário Online</button></div></div></div></section>';
    return h;
  }

  function viewBooking() {
    var b = ui.booking;
    var names = ['Serviço', 'Profissional', 'Data & Hora', 'Seus Dados'];
    var h = '<section class="container section"><div class="eyebrow">Agendamento Online</div><h1>Reserve seu horário</h1>' +
      '<div class="steps mt-3">' + names.map(function (n, i) {
        var num = i + 1, cls = b.step === num ? ' active' : (b.step > num || b.step === 5 ? ' done' : '');
        return '<button class="step-dot' + cls + '" data-act="book-goto" data-step="' + num + '"><span class="step-num">' + (b.step > num || b.step === 5 ? '✓' : num) + '</span>' + n + '</button>' + (i < 3 ? '<span class="step-line"></span>' : '');
      }).join('') + '</div>';

    if (b.confirmed && b.step === 5) {
      var a = b.confirmed;
      h += '<div class="card center" style="padding:44px"><div style="font-size:44px;color:var(--gold)">✓</div><h2 class="mt-2">Reserva confirmada!</h2><p class="muted mt-2">' + esc(a.serviceName) + ' com ' + esc(a.barberName) + '</p>' +
        '<p class="mono gold mt-2" style="font-size:18px">' + fmtDate(a.date) + ' às ' + esc(a.time) + '</p>' +
        '<p class="muted small mt-2">' + (a.paymentStatus === 'paid' ? 'Pagamento confirmado via ' + (a.paymentMethod === 'pix' ? 'Pix' : 'Cartão') : 'Pagamento será feito na barbearia') + ' · ' + money(a.servicePrice) + '</p>' +
        '<div class="row mt-4" style="justify-content:center"><button class="btn btn-primary" data-act="nav" data-view="appointments">Ver meus horários</button><button class="btn" data-act="nav" data-view="home">Voltar ao início</button></div></div>';
      return h + '</section>';
    }

    if (b.step === 1) {
      h += '<div class="grid grid-2">' + state.services.filter(function (s) { return s.active; }).map(function (s) {
        return '<button class="option ' + (b.serviceId === s.id ? 'selected' : '') + '" data-act="book-service" data-id="' + s.id + '"><div class="row-between"><div class="small muted">' + esc(s.category) + ' · ' + s.durationMinutes + ' min</div><div class="mono gold">' + money(s.price) + '</div></div><h3>' + esc(s.name) + '</h3><p>' + esc(s.description) + '</p></button>';
      }).join('') + '</div><div class="row mt-4"><button class="btn btn-primary" data-act="book-next"' + (b.serviceId ? '' : ' disabled') + '>Continuar ' + ic('arrow', 15) + '</button></div>';
    }

    if (b.step === 2) {
      h += '<div class="grid grid-3"><button class="option ' + (b.barberId === 'any' ? 'selected' : '') + '" data-act="book-barber" data-id="any"><div class="barber-option"><div style="width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--bg-4);color:var(--gold)">' + ic('user', 24) + '</div><div><h3>Sem Preferência</h3><p>Mostramos todos os horários livres do elenco.</p></div></div></button>' +
        state.barbers.filter(function (x) { return x.active; }).map(function (x) {
          return '<button class="option ' + (b.barberId === x.id ? 'selected' : '') + '" data-act="book-barber" data-id="' + x.id + '"><div class="barber-option"><img src="' + esc(x.photo) + '" alt=""><div><h3>' + esc(x.name) + '</h3><p>' + esc(x.specialty) + '<br>★ ' + barberStats(x.id, x.rating).average.toFixed(2) + '</p></div></div></button>';
        }).join('') + '</div><div class="row mt-4"><button class="btn" data-act="book-goto" data-step="1">Voltar</button><button class="btn btn-primary" data-act="book-next"' + (b.barberId ? '' : ' disabled') + '>Continuar ' + ic('arrow', 15) + '</button></div>';
    }

    if (b.step === 3) {
      var days = [];
      for (var i = 0; i < 21; i++) {
        var d = iso(i), count = availableTimes(d, b.barberId || 'any').length;
        days.push('<button class="date-chip ' + (b.date === d ? 'active' : '') + '" data-act="book-date" data-date="' + d + '"' + (count ? '' : ' disabled') + '><span class="small">' + DAYS[dow(d)] + '</span><strong>' + esc(d.slice(8)) + '</strong><span class="small">' + (count ? count + ' horários' : '—') + '</span></button>');
      }
      var times = b.date ? availableTimes(b.date, b.barberId || 'any') : [];
      h += '<div class="card"><div class="eyebrow">Escolha o dia</div><div class="date-strip mt-2">' + days.join('') + '</div><div class="divider"></div><div class="eyebrow">Horários disponíveis' + (b.date ? ' · ' + fmtDate(b.date) : '') + '</div>' +
        (times.length ? '<div class="time-grid mt-2">' + times.map(function (t) { return '<button class="time-slot ' + (b.time === t ? 'active' : '') + '" data-act="book-time" data-time="' + t + '">' + t + '</button>'; }).join('') + '</div>' : '<p class="muted mt-2">' + (b.date ? 'Nenhum horário livre nesta data.' : 'Selecione uma data acima.') + '</p>') + '</div>' +
        '<div class="row mt-4"><button class="btn" data-act="book-goto" data-step="2">Voltar</button><button class="btn btn-primary" data-act="book-next"' + (b.date && b.time ? '' : ' disabled') + '>Continuar ' + ic('arrow', 15) + '</button></div>';
    }

    if (b.step === 4) {
      var srv = state.services.find(function (x) { return x.id === b.serviceId; });
      var coupons = state.redeemedRewards.filter(function (r) { return r.status === 'available' && (!user() || r.userId === user().id); });
      var disc = (function () { var r = coupons.find(function (x) { return x.id === b.rewardId; }); return r ? Math.min(srv.price, r.discountAmount) : 0; })();
      h += '<form data-form="booking"><div style="display:grid;grid-template-columns:1fr 340px;gap:20px" class="booking-cols"><div class="card">' +
        '<h2>Seus Dados</h2><div class="form-grid mt-3"><label class="field"><span>Nome completo</span><input name="name" required minlength="3" value="' + esc(b.name || (user() ? user().name : '')) + '" placeholder="Seu nome"></label>' +
        '<label class="field"><span>Telefone / WhatsApp</span><input name="phone" required data-mask="phone" value="' + esc(b.phone || (user() ? user().phone : '')) + '" placeholder="(11) 99999-0000"></label></div>' +
        '<label class="field"><span>Observações (opcional)</span><textarea name="notes" placeholder="Alguma preferência?"></textarea></label>' +
        '<h3 class="mt-2">Forma de Pagamento</h3><label class="field mt-2"><span>Método</span><select name="method"><option value="pix"' + (b.payment === 'pix' ? ' selected' : '') + '>Pix (pagamento online)</option><option value="credit_card"' + (b.payment === 'credit_card' ? ' selected' : '') + '>Cartão de crédito</option><option value="in_shop"' + (b.payment === 'in_shop' ? ' selected' : '') + '>Pagar na barbearia</option></select></label>' +
        '<label class="field"><span>Parcelas (cartão)</span><select name="installments"><option>1</option><option>2</option><option>3</option><option>4</option><option>6</option></select></label>' +
        (coupons.length ? '<label class="field"><span>Cupom de desconto</span><select name="rewardId"><option value="">Nenhum cupom</option>' + coupons.map(function (r) { return '<option value="' + r.id + '" ' + (b.rewardId === r.id ? 'selected' : '') + '>' + esc(r.code) + ' — ' + esc(r.rewardTitle) + '</option>'; }).join('') + '</select></label>' : '') +
        '</div><aside class="card" style="align-self:start"><h2>Resumo da Reserva</h2><div class="mt-3"><div class="summary-line"><span>Serviço</span><strong>' + esc(srv.name) + '</strong></div><div class="summary-line"><span>Profissional</span><strong>' + esc(b.barberId && b.barberId !== 'any' ? (state.barbers.find(function (x) { return x.id === b.barberId; }) || {}).name : 'A definir') + '</strong></div>' +
        '<div class="summary-line"><span>Data</span><strong>' + fmtDate(b.date) + '</strong></div><div class="summary-line"><span>Horário</span><strong class="mono">' + esc(b.time) + '</strong></div><div class="summary-line"><span>Duração</span><strong>' + srv.durationMinutes + ' min</strong></div>' +
        (disc ? '<div class="summary-line"><span>Desconto</span><strong class="gold">- ' + money(disc) + '</strong></div>' : '') +
        '<div class="summary-line summary-total"><span>Total</span><strong class="gold mono">' + money(srv.price - disc) + '</strong></div>' +
        (state.loyaltyConfig.enabled && user() ? '<p class="small muted mt-2">Você ganhará ' + servicePoints(srv.price) + ' pontos EDY-K com esta reserva.</p>' : '') +
        '</div><button class="btn btn-primary btn-block btn-lg mt-4" type="submit">Confirmar Agendamento</button><button type="button" class="btn btn-block mt-2" data-act="book-goto" data-step="3">Voltar</button></aside></div></form>';
    }
    return h + '</section>';
  }

  function viewShop() {
    var cats = ['Todos'];
    state.products.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
    var list = state.products.filter(function (p) { return p.active && (ui.shopCat === 'Todos' || p.category === ui.shopCat); });
    return '<section class="container section"><div class="eyebrow">Grooming Oficial</div><h1>Loja EDY-K</h1><p class="muted mt-2">Produtos premium selecionados para sua rotina de cuidado masculino.</p>' +
      '<div class="row wrap mt-4">' + cats.map(function (c) { return '<button class="chip ' + (ui.shopCat === c ? 'active' : '') + '" data-act="shop-cat" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' +
      '<div class="grid grid-4 mt-4">' + list.map(function (p) {
        var price = p.promoPrice != null ? p.promoPrice : p.price, out = p.stock <= 0;
        return '<article class="card product-card"><div class="product-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></div><div class="product-body"><div><div class="small muted mb-1">' + esc(p.category) + ' · ' + (out ? '<span style="color:var(--danger)">Esgotado</span>' : p.stock + ' em estoque') + '</div><h3>' + esc(p.name) + '</h3><p class="small muted mt-1">' + esc(p.description) + '</p></div>' +
          '<div class="row-between mt-3"><div>' + (p.promoPrice != null ? '<div class="price-old">' + money(p.price) + '</div>' : '') + '<div class="price mono">' + money(price) + '</div></div><button class="btn btn-sm" ' + (out ? 'disabled' : '') + ' data-act="add-cart" data-id="' + p.id + '">' + (out ? 'Indisponível' : ic('plus', 13) + ' Adicionar') + '</button></div></div></article>';
      }).join('') + '</div></section>';
  }

  function viewAppointments() {
    var u = user();
    if (!u) return '<section class="container section"><div class="card empty"><h2>Entre na sua conta</h2><p class="muted mt-2">Faça login para acompanhar seus agendamentos e pedidos.</p><button class="btn btn-primary mt-3" data-act="nav" data-view="auth">Entrar</button></div></section>';
    var mine = state.appointments.filter(function (a) { return a.userId === u.id; });
    var upcoming = mine.filter(function (a) { return a.status !== 'completed' && a.status !== 'cancelled' && a.date >= iso(0); }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    var history = mine.filter(function (a) { return upcoming.indexOf(a) < 0; }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); });
    var list = ui.aptTab === 'upcoming' ? upcoming : history;
    var orders = state.orders.filter(function (o) { return o.userId === u.id; });
    var h = '<section class="container section"><div class="eyebrow">Área do Cliente</div><h1>Meus Horários</h1>' +
      '<div class="tabs mt-4"><button class="tab ' + (ui.aptTab === 'upcoming' ? 'active' : '') + '" data-act="apt-tab" data-tab="upcoming">Próximos (' + upcoming.length + ')</button><button class="tab ' + (ui.aptTab === 'history' ? 'active' : '') + '" data-act="apt-tab" data-tab="history">Histórico (' + history.length + ')</button></div>';
    h += list.length ? '<div class="grid grid-2">' + list.map(function (a) {
      var reviewed = state.reviews.some(function (r) { return r.appointmentId === a.id; });
      return '<article class="card"><div class="row-between"><div><div class="eyebrow">' + fmtDate(a.date) + ' · ' + esc(a.time) + '</div><h3>' + esc(a.serviceName) + '</h3><div class="small muted mt-1">com ' + esc(a.barberName) + '</div></div>' + statusBadge(a.status) + '</div>' +
        '<div class="divider"></div><div class="row-between small"><span class="muted">Pagamento</span><span>' + (a.paymentStatus === 'paid' ? 'Pago · ' + (a.paymentMethod === 'pix' ? 'Pix' : a.paymentMethod === 'credit_card' ? 'Cartão' : 'Na barbearia') : 'Pendente') + '</span></div>' +
        '<div class="row-between small mt-1"><span class="muted">Valor</span><strong class="gold mono">' + money(a.servicePrice) + '</strong></div>' +
        (a.pointsEarned ? '<div class="row-between small mt-1"><span class="muted">Pontos ganhos</span><span class="gold">+' + a.pointsEarned + '</span></div>' : '') +
        '<div class="row wrap mt-3">' + (a.status !== 'completed' && a.status !== 'cancelled' ? '<button class="btn btn-sm" data-act="book-reschedule" data-id="' + a.id + '">Remarcar</button><button class="btn btn-sm btn-danger" data-act="apt-cancel" data-id="' + a.id + '">Cancelar</button>' : '') +
        (a.status === 'completed' ? (reviewed ? '<span class="badge ok">Avaliado</span>' : '<button class="btn btn-sm" data-act="review-open" data-id="' + a.id + '">Avaliar atendimento</button>') : '') + '</div></article>';
    }).join('') + '</div>' : '<div class="card empty">Nenhum agendamento nesta lista. <button class="link-btn" data-act="book-start">Agendar agora ' + ic('arrow', 14) + '</button></div>';

    if (orders.length) {
      h += '<div class="mt-4">' + sectionHead('Loja EDY-K', 'Meus Pedidos') + '<div class="panel">' + orders.map(function (o) {
        return '<div class="row-between" style="padding:16px;border-bottom:1px solid var(--border);flex-wrap:wrap"><div><strong class="mono">' + esc(o.id.toUpperCase()) + '</strong><div class="small muted mt-1">' + o.items.map(function (i) { return i.quantity + '× ' + esc(i.name); }).join(', ') + '</div><div class="small muted mt-1">' + fmtDate(o.createdAt) + ' · ' + esc(o.fulfillment === 'delivery' ? 'Entrega' : 'Retirada') + '</div></div><div class="row"><strong class="gold mono">' + money(o.total) + '</strong>' + statusBadge(o.status) + '</div></div>';
      }).join('') + '</div></div>';
    }
    if (ui.reviewFor) {
      var apt = state.appointments.find(function (a) { return a.id === ui.reviewFor; });
      if (apt) h += '<div class="modal-wrap"><div class="overlay" data-act="review-close"></div><form class="modal" data-form="review"><div class="row-between"><h2>Avaliar atendimento</h2><button type="button" class="icon-btn" data-act="review-close">' + ic('x') + '</button></div><p class="muted small mt-2">' + esc(apt.serviceName) + ' · ' + esc(apt.barberName) + '</p>' +
        '<label class="field mt-3"><span>Nota do serviço</span><select name="serviceRating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>' +
        '<label class="field"><span>Nota do barbeiro</span><select name="barberRating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>' +
        '<label class="field"><span>Comentário</span><textarea name="comment" required minlength="5" placeholder="Conte como foi sua experiência"></textarea></label>' +
        '<button class="btn btn-primary btn-block" type="submit">Publicar avaliação</button></form></div>';
    }
    return h + '</section>';
  }

  function viewRewards() {
    var u = user(), balance = points();
    var coupons = state.redeemedRewards.filter(function (r) { return !u || r.userId === u.id; });
    var txs = state.pointTransactions.filter(function (t) { return !u || t.userId === u.id; }).slice(0, 20);
    return '<section class="container section"><div class="eyebrow">Programa de Fidelidade</div><h1>Meus Prêmios</h1>' +
      '<div class="card mt-4" style="background:linear-gradient(120deg,#18191C,#2a2415);border-color:rgba(226,183,67,.45)"><div class="row-between wrap"><div><div class="eyebrow">Saldo disponível</div><div class="display gold" style="font-size:48px">' + balance + ' <span class="small">pontos</span></div><p class="muted small mt-1">Acumule pontos a cada corte ou compra e troque por descontos exclusivos.</p></div><div style="font-size:60px;color:var(--gold)">' + ic('award', 60) + '</div></div></div>' +
      '<div class="mt-4">' + sectionHead('Resgate', 'Recompensas Disponíveis') + '<div class="grid grid-3">' + state.rewards.filter(function (r) { return r.active; }).map(function (r) {
        return '<article class="card card-hover"><div class="row-between"><div class="eyebrow">' + esc(r.appliesTo) + '</div><span class="badge gold">' + r.pointsCost + ' pts</span></div><h3 class="mt-2">' + esc(r.title) + '</h3><p class="small muted mt-1">' + esc(r.description) + '</p><button class="btn btn-primary btn-block mt-3" data-act="redeem" data-id="' + r.id + '">' + (balance >= r.pointsCost ? 'Resgatar cupom' : 'Pontos insuficientes') + '</button></article>';
      }).join('') + '</div></div>' +
      '<div class="mt-4">' + sectionHead('Cupons', 'Meus Resgates') + (coupons.length ? '<div class="panel">' + coupons.map(function (c) {
        return '<div class="row-between" style="padding:16px;border-bottom:1px solid var(--border);flex-wrap:wrap"><div><strong class="mono gold">' + esc(c.code) + '</strong><div class="small muted mt-1">' + esc(c.rewardTitle) + ' · ' + money(c.discountAmount) + ' OFF · ' + fmtDate(c.redeemedAt) + '</div></div>' + statusBadge(c.status) + '</div>';
      }).join('') + '</div>' : '<div class="card empty">Você ainda não resgatou nenhum cupom.</div>') + '</div>' +
      '<div class="mt-4">' + sectionHead('Extrato', 'Histórico de Pontos') + '<div class="panel table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Pontos</th></tr></thead><tbody>' +
      (txs.length ? txs.map(function (t) { return '<tr><td class="mono">' + fmtDate(t.createdAt) + '</td><td>' + esc(t.description) + '</td><td class="mono ' + (t.points >= 0 ? 'gold' : '') + '">' + (t.points > 0 ? '+' : '') + t.points + '</td></tr>'; }).join('') : '<tr><td colspan="3" class="center muted">Sem movimentações.</td></tr>') + '</tbody></table></div></div></section>';
  }

  function viewAuth(adminHint) {
    var isReg = ui.authTab === 'register';
    var h = '<section class="container section"><div style="max-width:480px;margin:0 auto"><div class="card">' +
      '<div class="center"><div class="row" style="justify-content:center">' + logo(52) + '</div><h2 class="mt-2">' + (adminHint ? 'Acesso ao Painel Admin' : (isReg ? 'Criar conta' : 'Bem-vindo de volta')) + '</h2><p class="muted small mt-1">' + (adminHint ? 'Entre com uma conta de administrador para continuar.' : 'Entre para agendar, acompanhar pedidos e acumular pontos.') + '</p></div>' +
      '<div class="segmented mt-3"><button class="' + (!isReg ? 'active' : '') + '" data-act="auth-tab" data-tab="login">Entrar</button><button class="' + (isReg ? 'active' : '') + '" data-act="auth-tab" data-tab="register">Cadastrar</button></div>';
    if (isReg) {
      h += '<form class="mt-3" data-form="register"><label class="field"><span>Nome completo</span><input name="name" required minlength="3" placeholder="Seu nome"></label><label class="field"><span>E-mail</span><input name="email" type="email" required placeholder="voce@email.com"></label><label class="field"><span>Telefone</span><input name="phone" required data-mask="phone" placeholder="(11) 99999-0000"></label><label class="field"><span>Senha</span><input name="password" type="password" required minlength="6" placeholder="Mínimo 6 caracteres"></label><button class="btn btn-primary btn-block btn-lg" type="submit">Criar conta</button></form>';
    } else {
      h += '<form class="mt-3" data-form="login"><label class="field"><span>E-mail</span><input name="email" type="email" required placeholder="voce@email.com"></label><label class="field"><span>Senha</span><input name="password" type="password" required placeholder="Sua senha"></label><button class="btn btn-primary btn-block btn-lg" type="submit">Entrar</button></form>' +
        '<div class="divider"></div><div class="eyebrow center">Acesso rápido (demonstração)</div><div class="grid grid-2 mt-2"><button class="btn btn-sm" data-act="quick-login" data-email="cliente@edyk.com">Entrar como cliente</button><button class="btn btn-sm" data-act="quick-login" data-email="admin@edyk.com">Entrar como admin</button></div>';
    }
    return h + '</div></div></section>';
  }

  /* ==========================================================
   * 6. Render — painel administrativo
   * ========================================================== */
  var CRUD = {
    users: { title: 'Usuários', key: 'users', prefix: 'user', fields: [
      { k: 'name', l: 'Nome', t: 'text' }, { k: 'email', l: 'E-mail', t: 'text' },
      { k: 'phone', l: 'Telefone', t: 'text' }, { k: 'password', l: 'Senha', t: 'text' },
      { k: 'role', l: 'Perfil', t: 'select', opts: ['client', 'admin'] }
    ] },
    services: { title: 'Serviços', key: 'services', prefix: 'srv', fields: [
      { k: 'name', l: 'Nome', t: 'text' }, { k: 'category', l: 'Categoria', t: 'select', opts: ['Cabelo', 'Barba', 'Combo', 'Acabamento'] },
      { k: 'price', l: 'Preço (R$)', t: 'number' }, { k: 'durationMinutes', l: 'Duração (min)', t: 'number' },
      { k: 'description', l: 'Descrição', t: 'textarea' }, { k: 'featured', l: 'Destaque', t: 'check' }, { k: 'active', l: 'Ativo', t: 'check' }
    ] },
    products: { title: 'Produtos', key: 'products', prefix: 'prod', fields: [
      { k: 'name', l: 'Nome', t: 'text' }, { k: 'category', l: 'Categoria', t: 'select', opts: ['Pomadas', 'Óleos para Barba', 'Shampoos', 'Kits'] },
      { k: 'price', l: 'Preço (R$)', t: 'number' }, { k: 'promoPrice', l: 'Preço promocional (R$)', t: 'number' }, { k: 'stock', l: 'Estoque', t: 'number' },
      { k: 'image', l: 'URL da imagem', t: 'text' }, { k: 'description', l: 'Descrição', t: 'textarea' },
      { k: 'featured', l: 'Destaque', t: 'check' }, { k: 'active', l: 'Ativo', t: 'check' }
    ] },
    barbers: { title: 'Barbeiros', key: 'barbers', prefix: 'barber', fields: [
      { k: 'name', l: 'Nome', t: 'text' }, { k: 'specialty', l: 'Especialidade', t: 'text' }, { k: 'bio', l: 'Bio', t: 'textarea' },
      { k: 'photo', l: 'URL da foto', t: 'text' }, { k: 'rating', l: 'Avaliação', t: 'number' }, { k: 'completedCuts', l: 'Cortes realizados', t: 'number' },
      { k: 'startHour', l: 'Início (00:00)', t: 'text' }, { k: 'endHour', l: 'Fim (00:00)', t: 'text' },
      { k: 'workDays', l: 'Dias de trabalho (0=Dom...6=Sáb, separados por vírgula)', t: 'text' }, { k: 'active', l: 'Ativo', t: 'check' }
    ] },
    rewards: { title: 'Recompensas', key: 'rewards', prefix: 'rew', fields: [
      { k: 'title', l: 'Título', t: 'text' }, { k: 'description', l: 'Descrição', t: 'textarea' },
      { k: 'pointsCost', l: 'Custo em pontos', t: 'number' }, { k: 'discountAmount', l: 'Desconto (R$)', t: 'number' },
      { k: 'appliesTo', l: 'Aplicável a', t: 'select', opts: ['service', 'product', 'both'] }, { k: 'active', l: 'Ativo', t: 'check' }
    ] }
  };

  function fieldHTML(f, val) {
    var v = val == null ? '' : val;
    if (f.t === 'check') return '<label class="checkbox-row"><input type="checkbox" name="' + f.k + '"' + (v ? ' checked' : '') + '> ' + esc(f.l) + '</label>';
    if (f.t === 'textarea') return '<label class="field"><span>' + esc(f.l) + '</span><textarea name="' + f.k + '">' + esc(v) + '</textarea></label>';
    if (f.t === 'select') return '<label class="field"><span>' + esc(f.l) + '</span><select name="' + f.k + '">' + f.opts.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></label>';
    return '<label class="field"><span>' + esc(f.l) + '</span><input name="' + f.k + '" type="' + (f.t === 'number' ? 'number' : 'text') + '" step="any" value="' + esc(Array.isArray(v) ? v.join(',') : v) + '"></label>';
  }

  function adminFormHTML() {
    var f = ui.adminForm;
    if (!f) return '';
    var cfg = CRUD[f.kind];
    var values = f.values || {};
    return '<div class="modal-wrap"><div class="overlay" data-act="admin-form-close"></div><form class="modal" data-form="admin-form"><div class="row-between"><h2>' + (f.id ? 'Editar' : 'Novo') + ' · ' + cfg.title + '</h2><button type="button" class="icon-btn" data-act="admin-form-close">' + ic('x') + '</button></div>' +
      '<div class="form-grid mt-3">' + cfg.fields.map(function (field) { return fieldHTML(field, values[field.k]); }).join('') + '</div>' +
      (f.kind === 'users' && f.id ? '<p class="small muted mt-2">Deixe a senha em branco para manter a atual.</p>' : '') +
      '<div class="row mt-3"><button class="btn btn-primary" type="submit">Salvar</button><button class="btn" type="button" data-act="admin-form-close">Cancelar</button></div></form></div>';
  }

  function adminCRUD(kind) {
    var cfg = CRUD[kind], list = state[cfg.key], isUsers = kind === 'users';
    var heads = cfg.fields.slice(0, 4).map(function (f) { return '<th>' + esc(f.l) + '</th>'; }).join('');
    var rows = list.map(function (item) {
      var cells = cfg.fields.slice(0, 4).map(function (f) {
        var v = item[f.k];
        if (f.k === 'password') v = '••••••';
        return '<td>' + (Array.isArray(v) ? esc(v.join(',')) : esc(v)) + '</td>';
      }).join('');
      var status = isUsers
        ? '<span class="badge ' + (item.role === 'admin' ? 'gold' : '') + '">' + esc(item.role === 'admin' ? 'admin' : 'client') + '</span>'
        : statusBadge(item.active ? 'confirmed' : 'cancelled');
      return '<tr>' + cells + '<td>' + status + '</td><td><div class="table-actions"><button class="btn btn-sm" data-act="admin-edit" data-kind="' + kind + '" data-id="' + item.id + '">' + ic('edit', 13) + '</button><button class="btn btn-sm btn-danger" data-act="admin-delete" data-kind="' + kind + '" data-id="' + item.id + '">' + ic('trash', 13) + '</button></div></td></tr>';
    }).join('');
    return '<div class="row-between"><div><div class="eyebrow">' + (isUsers ? 'Banco de dados' : 'CMS') + '</div><h2>' + cfg.title + '</h2></div><button class="btn btn-primary" data-act="admin-new" data-kind="' + kind + '">' + ic('plus', 15) + ' Novo</button></div>' +
      '<div class="panel table-wrap mt-3"><table><thead><tr>' + heads + '<th>' + (isUsers ? 'Perfil' : 'Status') + '</th><th>Ações</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="center muted">Nenhum item cadastrado.</td></tr>') + '</tbody></table></div>' + adminFormHTML();
  }

  function adminDashboard() {
    var revenue = state.appointments.filter(function (a) { return a.paymentStatus === 'paid'; }).reduce(function (s, a) { return s + a.servicePrice; }, 0);
    var ordersRevenue = state.orders.reduce(function (s, o) { return s + o.total; }, 0);
    var last7 = [];
    for (var i = 6; i >= 0; i--) {
      var d = iso(-i);
      last7.push({ d: d, n: state.appointments.filter(function (a) { return a.date === d && a.status !== 'cancelled'; }).length });
    }
    var max = Math.max.apply(null, last7.map(function (x) { return x.n; }).concat([1]));
    return '<div><div class="eyebrow">Visão Geral</div><h2>Dashboard</h2><div class="grid grid-4 mt-3">' +
      [['Agendamentos', state.appointments.length, 'calendar'], ['Receita de serviços', money(revenue), 'chart'], ['Pedidos na loja', state.orders.length, 'bag'], ['Receita da loja', money(ordersRevenue), 'bag']].map(function (k) {
        return '<div class="card"><div class="row muted small">' + ic(k[2], 16) + ' ' + k[0] + '</div><div class="display mt-2" style="font-size:24px">' + k[1] + '</div></div>';
      }).join('') + '</div>' +
      '<div class="grid grid-2 mt-4"><div class="panel panel-pad"><div class="eyebrow">Últimos 7 dias</div><h3>Agendamentos por dia</h3><div class="bars mt-3">' + last7.map(function (x) { return '<div class="bar-col"><div style="height:' + Math.max(4, (x.n / max) * 110) + 'px"></div><span>' + DAYS[dow(x.d)] + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="panel panel-pad"><div class="eyebrow">Elenco</div><h3>Profissionais ativos</h3><div class="mt-3">' + state.barbers.filter(function (b) { return b.active; }).map(function (b) { return '<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span>' + esc(b.name) + '</span><span class="gold small">★ ' + barberStats(b.id, b.rating).average.toFixed(2) + '</span></div>'; }).join('') + '</div></div></div>' +
      '<div class="mt-4">' + sectionHead('Movimento', 'Agendamentos Recentes') + '<div class="panel table-wrap"><table><thead><tr><th>Data</th><th>Cliente</th><th>Serviço</th><th>Barbeiro</th><th>Valor</th><th>Status</th></tr></thead><tbody>' +
      state.appointments.slice(0, 8).map(function (a) { return '<tr><td class="mono">' + fmtDate(a.date) + ' ' + esc(a.time) + '</td><td>' + esc(a.clientName) + '</td><td>' + esc(a.serviceName) + '</td><td>' + esc(a.barberName) + '</td><td class="mono">' + money(a.servicePrice) + '</td><td>' + statusBadge(a.status) + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>';
  }

  function adminAgenda() {
    var list = state.appointments.filter(function (a) { return a.date === ui.adminDate; }).sort(function (a, b) { return a.time.localeCompare(b.time); });
    return '<div><div class="eyebrow">Operação</div><h2>Agenda do dia</h2><label class="field mt-3" style="max-width:260px"><span>Data</span><input type="date" id="admin-date" value="' + esc(ui.adminDate) + '"></label>' +
      '<div class="panel table-wrap mt-3"><table><thead><tr><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Barbeiro</th><th>Pagamento</th><th>Status</th></tr></thead><tbody>' +
      (list.length ? list.map(function (a) { return '<tr><td class="mono">' + esc(a.time) + '</td><td>' + esc(a.clientName) + '<div class="small muted">' + esc(a.clientPhone) + '</div></td><td>' + esc(a.serviceName) + '</td><td>' + esc(a.barberName) + '</td><td>' + (a.paymentStatus === 'paid' ? 'Pago' : 'Pendente') + '</td><td><select data-act="admin-status" data-id="' + a.id + '" class="btn btn-sm"><option value="pending"' + (a.status === 'pending' ? ' selected' : '') + '>Pendente</option><option value="confirmed"' + (a.status === 'confirmed' ? ' selected' : '') + '>Confirmado</option><option value="completed"' + (a.status === 'completed' ? ' selected' : '') + '>Concluído</option><option value="cancelled"' + (a.status === 'cancelled' ? ' selected' : '') + '>Cancelado</option><option value="paid"' + (a.paymentStatus === 'pending' ? '' : '') + '>Marcar pago</option></select></td></tr>'; }).join('') : '<tr><td colspan="6" class="center muted">Nenhum agendamento nesta data.</td></tr>') + '</tbody></table></div></div>';
  }

  function adminReviews() {
    return '<div><div class="eyebrow">Moderação</div><h2>Avaliações</h2><div class="panel table-wrap mt-3"><table><thead><tr><th>Data</th><th>Cliente</th><th>Notas</th><th>Comentário</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
      state.reviews.map(function (r) { return '<tr><td class="mono">' + fmtDate(r.createdAt) + '</td><td>' + esc(r.clientName) + '<div class="small muted">' + esc(r.barberName) + '</div></td><td class="gold mono">' + r.serviceRating + '★ / ' + r.barberRating + '★</td><td style="max-width:340px">' + esc(r.comment) + '</td><td>' + statusBadge(r.status === 'approved' ? 'confirmed' : 'cancelled') + '</td><td><div class="table-actions"><button class="btn btn-sm" data-act="review-moderate" data-id="' + r.id + '">' + (r.status === 'approved' ? 'Ocultar' : 'Aprovar') + '</button><button class="btn btn-sm btn-danger" data-act="review-delete" data-id="' + r.id + '">' + ic('trash', 13) + '</button></div></td></tr>'; }).join('') + '</tbody></table></div></div>';
  }

  function adminSettings() {
    var s = state.settings;
    return '<div><div class="eyebrow">CMS</div><h2>Configurações da Barbearia</h2><form class="card mt-3" data-form="settings"><div class="form-grid">' +
      [['shopName', 'Nome da loja'], ['tagline', 'Slogan'], ['phone', 'Telefone'], ['whatsappUrl', 'URL do WhatsApp'], ['instagramHandle', 'Instagram'], ['address', 'Endereço'], ['neighborhood', 'Bairro / Cidade'], ['customLogoUrl', 'URL do logo personalizado'], ['deliveryFee', 'Taxa de entrega (R$)'], ['freeDeliveryThreshold', 'Entrega grátis acima de (R$)']].map(function (f) {
        return '<label class="field"><span>' + f[1] + '</span><input name="' + f[0] + '" value="' + esc(s[f[0]]) + '"></label>';
      }).join('') + '</div><label class="checkbox-row mt-2"><input type="checkbox" name="topNoticeEnabled"' + (s.topNoticeEnabled ? ' checked' : '') + '> Exibir aviso no topo</label><label class="field mt-2"><span>Texto do aviso</span><input name="topNoticeText" value="' + esc(s.topNoticeText) + '"></label>' +
      '<h3 class="mt-4">Horário de funcionamento</h3><div class="grid grid-4 mt-2">' + s.schedule.map(function (d) {
        return '<div class="card" style="padding:14px"><strong>' + esc(d.dayLabel) + '</strong><label class="checkbox-row mt-2"><input type="checkbox" name="day_' + d.dayIndex + '_closed"' + (d.closed ? ' checked' : '') + '> Fechado</label><div class="row mt-2"><input name="day_' + d.dayIndex + '_open" value="' + esc(d.open) + '" placeholder="Abertura"><input name="day_' + d.dayIndex + '_close" value="' + esc(d.close) + '" placeholder="Fechamento"></div></div>';
      }).join('') + '</div><div class="row mt-4"><button class="btn btn-primary" type="submit">Salvar configurações</button><button class="btn btn-danger" type="button" data-act="admin-reset">' + ic('refresh', 14) + ' Restaurar dados de demonstração</button></div></form></div>';
  }

  function adminLoyalty() {
    var c = state.loyaltyConfig;
    return '<div><div class="eyebrow">Fidelidade</div><h2>Regras de Pontuação</h2><form class="card mt-3" data-form="loyalty"><div class="grid grid-3">' +
      [['enabled', 'Programa ativo', 'check'], ['pointsPerRealService', 'Pontos por R$ em serviços', 'number'], ['bookingBonusPoints', 'Bônus por agendamento', 'number'], ['pointsPerRealProduct', 'Pontos por R$ em produtos', 'number'], ['productBonusPoints', 'Bônus por compra', 'number']].map(function (f) {
        if (f[2] === 'check') return '<label class="checkbox-row"><input type="checkbox" name="' + f[0] + '"' + (c[f[0]] ? ' checked' : '') + '> ' + f[1] + '</label>';
        return '<label class="field"><span>' + f[1] + '</span><input type="number" step="any" name="' + f[0] + '" value="' + esc(c[f[0]]) + '"></label>';
      }).join('') + '</div><button class="btn btn-primary mt-3" type="submit">Salvar regras</button></form>' +
      '<p class="muted small mt-3">Para editar as recompensas, use a aba <button class="link-btn" data-act="admin-tab" data-tab="rewards">Recompensas</button>.</p></div>';
  }

  function adminSupabase() {
    var c = sbConfig(), test = ui.sbTest;
    var partial = !sbReady() && !!(c.url || c.anonKey);
    var status = partial ? 'Configuração incompleta — falta ' + (!c.url ? 'Project URL' : 'anon key')
      : !sbReady() ? 'Não configurado'
      : (!sb.checked ? 'Configurado — aguardando primeira conexão'
      : sb.ok ? 'Conectado' : 'Erro de conexão');
    var badge = !sbReady() ? 'warn' : (sb.checked && sb.ok ? 'ok' : (sb.checked ? 'bad' : 'warn'));
    return '<div><div class="eyebrow">Banco de dados</div><h2>Supabase</h2>' +
      '<p class="muted small mt-2">Usuários e produtos são lidos e gravados diretamente no Supabase via REST. Os demais dados (agendamentos, pedidos, pontos etc.) continuam no armazenamento local.</p>' +
      '<div class="card mt-3"><div class="row-between wrap"><div><div class="eyebrow">Status</div><h3 class="mt-1">' + esc(status) + '</h3></div><span class="badge ' + badge + '">' + esc(partial ? 'incompleto' : sbReady() ? (sb.checked ? (sb.ok ? 'online' : 'falhou') : 'configurado') : 'offline') + '</span></div>' +
      (sb.error ? '<p class="small mt-2" style="color:var(--danger);word-break:break-all">' + esc(sb.error) + '</p>' : '') + '</div>' +
      '<form class="card mt-3" data-form="supabase-config"><h3>Conexão</h3><div class="form-grid mt-3">' +
      '<label class="field"><span>Project URL</span><input name="url" value="' + esc(c.url) + '" placeholder="https://xxxx.supabase.co"></label>' +
      '<label class="field"><span>anon / public key</span><input name="anonKey" value="' + esc(c.anonKey) + '" placeholder="eyJhbGci..."></label></div>' +
      '<p class="small muted mt-2">A anon key é pública e pode ficar no front-end. Nunca coloque a <strong>service_role</strong> aqui — ela deve permanecer apenas no servidor.</p>' +
      '<div class="row wrap mt-3"><button class="btn btn-primary" type="submit">Salvar e conectar</button>' +
      '<button class="btn" type="button" data-act="sb-connect"' + (sbReady() ? '' : ' disabled') + '>Testar conexão</button>' +
      '<button class="btn" type="button" data-act="sb-publish"' + (sbReady() ? '' : ' disabled') + '>Publicar dados iniciais</button>' +
      '<button class="btn btn-danger" type="button" data-act="sb-test"' + (sbReady() && !(test && test.running) ? '' : ' disabled') + '>' + (test && test.running ? 'Testando...' : 'Testar insert/exclusão') + '</button></div></form>' +
      (test ? '<div class="card mt-3"><div class="row-between"><h3>Resultado do teste</h3><span class="badge ' + (test.running ? 'warn' : test.ok ? 'ok' : 'bad') + '">' + (test.running ? 'em andamento' : test.ok ? 'passou' : 'falhou') + '</span></div><div class="mt-3">' +
        test.steps.map(function (s) { return '<div class="row-between small" style="padding:8px 0;border-bottom:1px solid var(--border)"><span>' + esc(s.text) + '</span><span style="color:' + (s.ok ? 'var(--gold)' : 'var(--danger)') + '">' + (s.ok ? 'OK' : 'FALHA') + '</span></div>'; }).join('') +
        '</div></div>' : '') +
      '<p class="muted small mt-3">Antes de usar, execute <code>supabase.sql</code> no SQL Editor do projeto para criar as tabelas e as políticas RLS. O teste cria um usuário e um produto temporários, consulta ambos e depois os exclui. Também é possível rodar <code>node test-supabase.mjs</code> no terminal.</p></div>';
  }

  function viewAdmin() {
    if (!isAdmin()) return viewAuth(true);
    var tabs = [['dashboard', 'Dashboard'], ['agenda', 'Agenda'], ['users', 'Usuários'], ['services', 'Serviços'], ['products', 'Produtos'], ['barbers', 'Barbeiros'], ['rewards', 'Recompensas'], ['reviews', 'Avaliações'], ['loyalty', 'Fidelidade'], ['supabase', 'Supabase'], ['settings', 'Configurações']];
    var body;
    switch (ui.adminTab) {
      case 'agenda': body = adminAgenda(); break;
      case 'users': body = adminCRUD('users'); break;
      case 'services': body = adminCRUD('services'); break;
      case 'products': body = adminCRUD('products'); break;
      case 'barbers': body = adminCRUD('barbers'); break;
      case 'rewards': body = adminCRUD('rewards'); break;
      case 'reviews': body = adminReviews(); break;
      case 'loyalty': body = adminLoyalty(); break;
      case 'supabase': body = adminSupabase(); break;
      case 'settings': body = adminSettings(); break;
      default: body = adminDashboard();
    }
    return '<section class="container section"><div class="row-between wrap"><div><div class="eyebrow">Área restrita</div><h1>Painel Administrativo</h1></div><button class="btn" data-act="admin-exit">' + ic('logout', 15) + ' Sair do painel</button></div>' +
      '<div class="admin-layout mt-4"><aside class="card admin-side">' + tabs.map(function (t) { return '<button class="' + (ui.adminTab === t[0] ? 'active' : '') + '" data-act="admin-tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</aside><div class="panel panel-pad">' + body + '</div></div></section>' +
      '<style>@media(max-width:900px){.admin-layout{grid-template-columns:1fr}}</style>';
  }

  /* ==========================================================
   * 7. Render principal, carrinho e toasts
   * ========================================================== */
  var VIEWS = ['home', 'booking', 'shop', 'appointments', 'rewards', 'auth', 'admin'];

  function renderView() {
    var el = document.getElementById('view');
    switch (ui.view) {
      case 'booking': el.innerHTML = viewBooking(); break;
      case 'shop': el.innerHTML = viewShop(); break;
      case 'appointments': el.innerHTML = viewAppointments(); break;
      case 'rewards': el.innerHTML = viewRewards(); break;
      case 'auth': el.innerHTML = viewAuth(false); break;
      case 'admin': el.innerHTML = viewAdmin(); break;
      default: el.innerHTML = viewHome();
    }
  }
  function render() {
    renderNotice(); renderHeader(); renderView(); renderFooter(); renderMobileNav(); renderCart(); renderToasts();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function renderToasts() {
    document.getElementById('toasts').innerHTML = ui.toasts.map(function (t) {
      return '<div class="toast ' + t.type + '">' + esc(t.text) + '</div>';
    }).join('');
  }
  function renderCart() {
    var root = document.getElementById('cart-root');
    if (!ui.cartOpen) { root.innerHTML = ''; return; }
    var lines = state.cart.map(function (i) {
      var p = state.products.find(function (x) { return x.id === i.productId; });
      if (!p) return '';
      var unit = p.promoPrice != null ? p.promoPrice : p.price;
      return '<div class="cart-item"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"><div class="grow"><div class="row-between"><strong style="font-size:13px">' + esc(p.name) + '</strong><button class="link-btn" data-act="cart-remove" data-id="' + p.id + '">' + ic('trash', 14) + '</button></div><div class="small muted mt-1">' + money(unit) + ' / un.</div>' +
        '<div class="row-between mt-2"><div class="qty"><button data-act="cart-qty" data-id="' + p.id + '" data-delta="-1">−</button><span class="mono">' + i.quantity + '</span><button data-act="cart-qty" data-id="' + p.id + '" data-delta="1">+</button></div><strong class="gold mono">' + money(unit * i.quantity) + '</strong></div></div></div>';
    }).join('');
    var subtotal = cartSubtotal();
    var body, foot;
    if (ui.cartTab === 'checkout') {
      var coupons = state.redeemedRewards.filter(function (r) { return r.status === 'available' && (!user() || r.userId === user().id); });
      body = '<form data-form="checkout"><h2>Finalizar pedido</h2>' +
        '<div class="form-grid mt-3"><label class="field"><span>Nome</span><input name="name" required value="' + esc(user() ? user().name : '') + '"></label><label class="field"><span>Telefone</span><input name="phone" required data-mask="phone" value="' + esc(user() ? user().phone : '') + '"></label></div>' +
        '<label class="field"><span>Entrega</span><select name="fulfillment"><option value="pickup">Retirada na barbearia (grátis)</option><option value="delivery">Entrega (' + money(state.settings.deliveryFee) + ')</option></select></label>' +
        '<label class="field"><span>Endereço de entrega</span><input name="address" placeholder="Rua, número, bairro"></label>' +
        '<label class="field"><span>Pagamento</span><select name="method"><option value="pix">Pix</option><option value="credit_card">Cartão de crédito</option></select></label>' +
        '<label class="field"><span>Parcelas</span><select name="installments"><option>1</option><option>2</option><option>3</option><option>4</option><option>6</option></select></label>' +
        (coupons.length ? '<label class="field"><span>Cupom</span><select name="rewardId"><option value="">Nenhum cupom</option>' + coupons.map(function (r) { return '<option value="' + r.id + '">' + esc(r.code) + ' — ' + esc(r.rewardTitle) + '</option>'; }).join('') + '</select></label>' : '') +
        '<button class="btn btn-primary btn-block btn-lg mt-2" type="submit">Confirmar pedido · ' + money(subtotal) + '</button></form>';
      foot = '<button class="btn btn-block" data-act="cart-tab" data-tab="cart">Voltar ao carrinho</button>';
    } else {
      body = state.cart.length ? lines : '<div class="empty">' + ic('bag', 40) + '<p class="mt-2">Seu carrinho está vazio.</p><button class="btn btn-primary mt-3" data-act="nav" data-view="shop">Explorar a loja</button></div>';
      foot = state.cart.length ? '<div class="row-between"><span class="muted small">Subtotal</span><strong class="gold mono" style="font-size:20px">' + money(subtotal) + '</strong></div><button class="btn btn-primary btn-block btn-lg mt-2" data-act="cart-tab" data-tab="checkout">Finalizar compra</button>' : '';
    }
    root.innerHTML = '<div class="overlay" data-act="cart-close"></div><aside class="drawer"><div class="drawer-head"><h2>' + (ui.cartTab === 'checkout' ? 'Checkout' : 'Carrinho (' + cartCount() + ')') + '</h2><button class="icon-btn" data-act="cart-close">' + ic('x') + '</button></div><div class="drawer-body">' + body + '</div><div class="drawer-foot">' + foot + '</div></aside>';
  }

  function nav(view) {
    if (VIEWS.indexOf(view) < 0) view = 'home';
    if (location.hash === '#/' + view) { ui.view = view; render(); }
    else location.hash = '/' + view;
  }
  function syncHash() {
    var v = (location.hash || '').replace(/^#\/?/, '');
    ui.view = VIEWS.indexOf(v) >= 0 ? v : 'home';
    render();
  }
  function startBooking(opts) {
    opts = opts || {};
    var u = user();
    ui.booking = {
      step: 1, serviceId: opts.serviceId || '', barberId: opts.barberId || '', date: '', time: '',
      reschedule: opts.reschedule || null, confirmed: null, payment: 'pix', rewardId: '',
      name: u ? u.name : '', phone: u ? u.phone : '', installments: 1
    };
    if (opts.reschedule) {
      var a = opts.reschedule;
      ui.booking.serviceId = a.serviceId; ui.booking.barberId = a.barberId;
      ui.booking.date = a.date; ui.booking.time = a.time; ui.booking.step = 3;
    }
    nav('booking');
  }

  /* ==========================================================
   * 8. Eventos
   * ========================================================== */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    switch (a) {
      case 'nav': nav(el.getAttribute('data-view')); break;
      case 'notice-close': ui.noticeDismissed = true; renderNotice(); break;
      case 'cart-open': ui.cartOpen = true; renderCart(); break;
      case 'cart-close': ui.cartOpen = false; renderCart(); break;
      case 'cart-tab': ui.cartTab = el.getAttribute('data-tab'); renderCart(); break;
      case 'add-cart': addToCart(id, 1); break;
      case 'cart-qty': setQty(id, Number(el.getAttribute('data-delta'))); break;
      case 'cart-remove': removeFromCart(id); break;
      case 'book-start': startBooking({ serviceId: el.getAttribute('data-service') || '', barberId: el.getAttribute('data-barber') || '' }); break;
      case 'book-next': ui.booking.step = Math.min(4, ui.booking.step + 1); render(); break;
      case 'book-goto': ui.booking.step = Number(el.getAttribute('data-step')); render(); break;
      case 'book-service': ui.booking.serviceId = id; render(); break;
      case 'book-barber': ui.booking.barberId = id; render(); break;
      case 'book-date': ui.booking.date = el.getAttribute('data-date'); ui.booking.time = ''; render(); break;
      case 'book-time': ui.booking.time = el.getAttribute('data-time'); render(); break;
      case 'book-reschedule': {
        var apt = state.appointments.find(function (x) { return x.id === id; });
        if (apt) startBooking({ reschedule: apt });
        break;
      }
      case 'apt-tab': ui.aptTab = el.getAttribute('data-tab'); renderView(); break;
      case 'apt-cancel':
        if (window.confirm('Deseja cancelar este agendamento?')) setAppointmentStatus(id, 'cancelled');
        break;
      case 'review-open': ui.reviewFor = id; renderView(); break;
      case 'review-close': ui.reviewFor = null; renderView(); break;
      case 'redeem': redeemReward(id); break;
      case 'shop-cat': ui.shopCat = el.getAttribute('data-cat'); renderView(); break;
      case 'auth-tab': ui.authTab = el.getAttribute('data-tab'); renderView(); break;
      case 'quick-login': {
        var res = login(el.getAttribute('data-email'), el.getAttribute('data-email').indexOf('admin') === 0 ? 'admin123' : '123456');
        if (res.ok) nav(ui.view === 'admin' || location.hash.indexOf('admin') >= 0 ? 'admin' : 'home');
        break;
      }
      case 'logout': logout(); nav('home'); break;
      case 'admin-tab': ui.adminTab = el.getAttribute('data-tab'); renderView(); break;
      case 'admin-new': {
        var kindNew = el.getAttribute('data-kind');
        var hasActive = CRUD[kindNew].fields.some(function (f) { return f.k === 'active'; });
        ui.adminForm = { kind: kindNew, id: null, values: hasActive ? { active: true } : {} };
        renderView();
        break;
      }
      case 'admin-edit': {
        var kind = el.getAttribute('data-kind');
        ui.adminForm = { kind: kind, id: id, values: clone(state[CRUD[kind].key].find(function (x) { return x.id === id; }) || {}) };
        if (kind === 'users') ui.adminForm.values.password = '';
        renderView();
        break;
      }
      case 'admin-form-close': ui.adminForm = null; renderView(); break;
      case 'admin-delete': {
        var k2 = el.getAttribute('data-kind');
        if (k2 === 'users' && state.currentUser && state.currentUser.id === id) {
          notify('Não é possível excluir o usuário que está logado.', 'error');
          break;
        }
        if (window.confirm('Excluir este item?')) {
          state[CRUD[k2].key] = state[CRUD[k2].key].filter(function (x) { return x.id !== id; });
          if (k2 === 'products') state.cart = state.cart.filter(function (i) { return i.productId !== id; });
          persist();
          if (k2 === 'users' || k2 === 'products') sbRemove(k2, id);
          render(); notify(k2 === 'users' ? 'Usuário removido.' : 'Item removido.', 'info');
        }
        break;
      }
      case 'review-moderate': {
        var r = state.reviews.find(function (x) { return x.id === id; });
        if (r) { r.status = r.status === 'approved' ? 'hidden' : 'approved'; persist(); render(); notify('Status da avaliação atualizado.', 'info'); }
        break;
      }
      case 'review-delete':
        if (window.confirm('Excluir avaliação permanentemente?')) {
          state.reviews = state.reviews.filter(function (x) { return x.id !== id; });
          persist(); render(); notify('Avaliação removida.', 'info');
        }
        break;
      case 'admin-reset':
        if (window.confirm('Restaurar todos os dados de demonstração?')) resetDemo();
        break;
      case 'sb-connect':
        sbLoad().then(function (ok) {
          notify(ok ? 'Conexão com o Supabase OK.' : 'Falha ao conectar: ' + (sb.error || 'verifique URL, chave e tabelas.'), ok ? 'success' : 'error');
          renderView();
        });
        break;
      case 'sb-publish': sbPublishSeed(); break;
      case 'sb-test': sbSelfTest(); break;
      case 'admin-exit': nav('home'); break;
    }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    var form = f.getAttribute('data-form'), fd = new FormData(f);
    var res, cfg, item, obj;
    switch (form) {
      case 'login':
        res = login(fd.get('email'), fd.get('password'));
        if (!res.ok) notify(res.error, 'error'); else nav(user().role === 'admin' && location.hash.indexOf('admin') >= 0 ? 'admin' : 'home');
        break;
      case 'register':
        res = register({ name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), password: fd.get('password') });
        if (!res.ok) notify(res.error, 'error'); else nav('home');
        break;
      case 'booking': confirmBooking(fd); break;
      case 'review': submitReview(fd, ui.reviewFor); break;
      case 'checkout': createOrder(fd); break;
      case 'admin-form':
        if (!ui.adminForm) return;
        cfg = CRUD[ui.adminForm.kind];
        var syncedKind = ui.adminForm.kind;
        obj = {};
        cfg.fields.forEach(function (field) {
          if (field.t === 'check') obj[field.k] = fd.has(field.k);
          else if (field.t === 'number') obj[field.k] = Number(fd.get(field.k) || 0);
          else obj[field.k] = String(fd.get(field.k) || '').trim();
        });
        if (syncedKind === 'barbers') obj.workDays = String(obj.workDays).split(',').map(Number).filter(function (n) { return n >= 0 && n <= 6 && !isNaN(n); });
        if (cfg.fields.some(function (x) { return x.k === 'promoPrice'; }) && !obj.promoPrice) delete obj.promoPrice;
        if (syncedKind === 'users') {
          obj.email = String(obj.email || '').trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email)) { notify('E-mail inválido.', 'error'); return; }
          if (state.users.some(function (x) { return x.id !== ui.adminForm.id && x.email.toLowerCase() === obj.email; })) {
            notify('Já existe um usuário com este e-mail.', 'error'); return;
          }
          if (!obj.password && ui.adminForm.id) {
            var existingUser = state.users.find(function (x) { return x.id === ui.adminForm.id; });
            if (existingUser) obj.password = existingUser.password;
          }
          if (!obj.password) { notify('Informe a senha do usuário.', 'error'); return; }
        }
        if (ui.adminForm.id) {
          item = state[cfg.key].find(function (x) { return x.id === ui.adminForm.id; });
          if (item) Object.keys(obj).forEach(function (k) { item[k] = obj[k]; });
          notify('Item atualizado.');
        } else {
          obj.id = uid(cfg.prefix);
          if (syncedKind === 'users') obj.createdAt = iso(0);
          state[cfg.key].unshift(obj);
          notify('Item cadastrado com sucesso.');
        }
        if (syncedKind === 'users' || syncedKind === 'products') sbUpsert(syncedKind, item || obj);
        ui.adminForm = null; persist(); render();
        break;
      case 'supabase-config': {
        var cfgUrl = String(fd.get('url') || '').trim().replace(/\/+$/, '');
        var cfgKey = String(fd.get('anonKey') || '').trim();
        try { localStorage.setItem(SB_CONFIG_KEY, JSON.stringify({ url: cfgUrl, anonKey: cfgKey })); } catch (e) { /* ignore */ }
        sb.checked = false; sb.ok = false; sb.error = '';
        notify('Configuração salva. Conectando...', 'info');
        renderView();
        sbLoad().then(function (ok) {
          notify(ok ? 'Conectado ao Supabase.' : 'Não foi possível conectar: ' + (sb.error || 'verifique URL, chave e tabelas.'), ok ? 'success' : 'error');
          renderView();
        });
        break;
      }
      case 'settings': {
        var s = state.settings;
        ['shopName', 'tagline', 'phone', 'whatsappUrl', 'instagramHandle', 'address', 'neighborhood', 'customLogoUrl', 'topNoticeText'].forEach(function (k) { s[k] = String(fd.get(k) || '').trim(); });
        s.deliveryFee = Number(fd.get('deliveryFee') || 0);
        s.freeDeliveryThreshold = Number(fd.get('freeDeliveryThreshold') || 0);
        s.topNoticeEnabled = fd.has('topNoticeEnabled');
        s.schedule.forEach(function (d) {
          d.closed = fd.has('day_' + d.dayIndex + '_closed');
          d.open = String(fd.get('day_' + d.dayIndex + '_open') || d.open);
          d.close = String(fd.get('day_' + d.dayIndex + '_close') || d.close);
        });
        persist(); render(); notify('Configurações salvas e publicadas!');
        break;
      }
      case 'loyalty': {
        var c = state.loyaltyConfig;
        c.enabled = fd.has('enabled');
        ['pointsPerRealService', 'bookingBonusPoints', 'pointsPerRealProduct', 'productBonusPoints'].forEach(function (k) { c[k] = Number(fd.get(k) || 0); });
        persist(); render(); notify('Regras de pontuação atualizadas!');
        break;
      }
    }
  });

  document.addEventListener('input', function (e) {
    var t = e.target, m = t.getAttribute && t.getAttribute('data-mask');
    if (!m) return;
    var pos = t.selectionStart;
    t.value = m === 'phone' ? maskPhone(t.value) : m === 'card' ? maskCard(t.value) : m === 'expiry' ? maskExpiry(t.value) : t.value;
    try { t.setSelectionRange(pos, pos); } catch (err) { /* ignore */ }
  });

  document.addEventListener('change', function (e) {
    var t = e.target, a = t.getAttribute && t.getAttribute('data-act');
    if (a === 'admin-date') { ui.adminDate = t.value; renderView(); }
    else if (a === 'admin-status') setAppointmentStatus(t.getAttribute('data-id'), t.value);
    else if (t.name === 'rewardId' && ui.view === 'booking') ui.booking.rewardId = t.value;
  });

  window.addEventListener('hashchange', syncHash);

  /* ==========================================================
   * 9. Inicialização
   * ========================================================== */
  syncHash();
  initRemote();
})();
