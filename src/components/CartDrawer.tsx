import React, { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, Store, Ticket, Trash2, Truck, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, maskPhoneBR } from '../utils/format';
import { CheckoutModal, CheckoutResult } from './CheckoutModal';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onOrderComplete: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose, onOrderComplete }) => {
  const {
    cart,
    products,
    settings,
    currentUser,
    loyaltyConfig,
    redeemedRewards,
    calculateProductPoints,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    createProductOrder,
    notify,
  } = useStore();

  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  if (!open) return null;

  const detailedItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { item, product, unitPrice: product.promoPrice ?? product.price };
    })
    .filter(Boolean) as Array<{
    item: { productId: string; quantity: number };
    product: (typeof products)[number];
    unitPrice: number;
  }>;

  const availableProductVouchers = useMemo(() => {
    if (!currentUser || !loyaltyConfig.enabled) return [];
    return redeemedRewards.filter(
      (r) =>
        r.userId === currentUser.id &&
        r.status === 'available' &&
        (r.appliesTo === 'product' || r.appliesTo === 'both')
    );
  }, [currentUser, loyaltyConfig.enabled, redeemedRewards]);

  const appliedVoucher = availableProductVouchers.find((v) => v.id === selectedRewardId) || null;
  const discountAmount = appliedVoucher ? Math.min(cartSubtotal, appliedVoucher.discountAmount) : 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const freeDeliveryQualified = cartSubtotal >= settings.freeDeliveryThreshold;
  const deliveryFee =
    fulfillment === 'delivery' && !freeDeliveryQualified ? settings.deliveryFee : 0;
  const total = discountedSubtotal + deliveryFee;
  const pointsToEarn = currentUser ? calculateProductPoints(discountedSubtotal) : 0;

  const handleProceedCheckout = () => {
    if (detailedItems.length === 0) return;
    if (fulfillment === 'delivery' && deliveryAddress.trim().length < 6) {
      notify('Informe o endereço completo para entrega.', 'error');
      return;
    }
    if (!currentUser && guestName.trim().length < 2) {
      notify('Informe seu nome para identificar o pedido.', 'error');
      return;
    }
    setOrderRef(`LOJA-${Date.now().toString().slice(-6)}`);
    setCheckoutOpen(true);
  };

  const handlePaymentApproved = (res: CheckoutResult) => {
    createProductOrder({
      fulfillment,
      deliveryAddress: fulfillment === 'delivery' ? deliveryAddress.trim() : undefined,
      paymentMethod: res.method,
      paymentStatus: 'paid',
      installments: res.installments,
      clientName: currentUser?.name || guestName.trim(),
      clientPhone: currentUser?.phone || guestPhone.trim(),
      appliedRewardId: appliedVoucher?.id,
    });
    setSelectedRewardId('');
    notify('Pedido confirmado e estoque atualizado!');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
        <div className="w-full max-w-md h-full bg-[#18191C] border-l border-[#2C2E33] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C2E33]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#E2B743]" />
              <h2 className="font-display text-xl uppercase text-white">Seu Carrinho</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar carrinho"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#A0A4AB] hover:text-white hover:bg-[#222428] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {detailedItems.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="w-10 h-10 text-[#555961] mx-auto mb-3" />
                <p className="text-sm font-medium text-white">Seu carrinho está vazio</p>
                <p className="text-xs text-[#A0A4AB] mt-1">
                  Adicione pomadas, óleos ou kits da linha oficial EDY-K.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {detailedItems.map(({ item, product, unitPrice }) => (
                    <div
                      key={product.id}
                      className="flex gap-3.5 rounded-xl border border-[#2C2E33] bg-[#0D0E10] p-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover shrink-0 bg-[#18191C]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                            {product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id)}
                            aria-label="Remover item"
                            className="p-1 text-[#A0A4AB] hover:text-red-400 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono-tabular text-sm font-bold text-[#E2B743]">
                            {formatBRL(unitPrice * item.quantity)}
                          </span>
                          <div className="flex items-center gap-1 rounded-lg border border-[#2C2E33] bg-[#18191C]">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-white hover:text-[#E2B743] cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono-tabular text-xs font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={item.quantity >= product.stock}
                              onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-white hover:text-[#E2B743] disabled:opacity-35 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fulfillment Selection */}
                <div className="pt-4 border-t border-[#2C2E33] space-y-3">
                  <span className="block text-xs font-medium uppercase tracking-wider text-[#A0A4AB]">
                    Recebimento
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillment('pickup')}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                        fulfillment === 'pickup'
                          ? 'border-[#E2B743] bg-[#E2B743]/10 text-white'
                          : 'border-[#2C2E33] bg-[#222428] text-[#A0A4AB]'
                      }`}
                    >
                      <Store className="w-4 h-4 text-[#E2B743] shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white">Retirar no local</div>
                        <div className="text-[11px] text-emerald-400">Grátis</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillment('delivery')}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                        fulfillment === 'delivery'
                          ? 'border-[#E2B743] bg-[#E2B743]/10 text-white'
                          : 'border-[#2C2E33] bg-[#222428] text-[#A0A4AB]'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-[#E2B743] shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white">Entrega SP</div>
                        <div className="text-[11px] text-[#A0A4AB]">
                          {freeDeliveryQualified ? 'Grátis' : formatBRL(settings.deliveryFee)}
                        </div>
                      </div>
                    </button>
                  </div>

                  {fulfillment === 'delivery' && (
                    <div>
                      <label className="block text-xs text-[#A0A4AB] mb-1">Endereço de entrega</label>
                      <input
                        type="text"
                        placeholder="Rua, número, complemento e bairro"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                      />
                    </div>
                  )}

                  {!currentUser && (
                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp (11) 99999-9999"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(maskPhoneBR(e.target.value))}
                        className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Totals */}
          {detailedItems.length > 0 && (
            <div className="border-t border-[#2C2E33] p-5 bg-[#141518] space-y-3">
              {availableProductVouchers.length > 0 && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[#E2B743] mb-1">
                    <Ticket className="w-3.5 h-3.5" />
                    Cupom de Fidelidade
                  </label>
                  <select
                    value={selectedRewardId}
                    onChange={(e) => setSelectedRewardId(e.target.value)}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-xs text-white focus:border-[#E2B743] focus:outline-none"
                  >
                    <option value="">Não aplicar cupom</option>
                    {availableProductVouchers.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.code} — {v.rewardTitle} (-{formatBRL(v.discountAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#A0A4AB]">
                  <span>Subtotal</span>
                  <span className="font-mono-tabular text-white">{formatBRL(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-xs">
                    <span>Desconto Fidelidade</span>
                    <span className="font-mono-tabular">-{formatBRL(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A0A4AB]">
                  <span>{fulfillment === 'pickup' ? 'Retirada na barbearia' : 'Taxa de entrega'}</span>
                  <span className="font-mono-tabular text-emerald-400">
                    {deliveryFee === 0 ? 'Grátis' : formatBRL(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#2C2E33] text-base font-bold">
                  <span className="text-white">Total</span>
                  <span className="font-mono-tabular text-[#E2B743]">{formatBRL(total)}</span>
                </div>
                {pointsToEarn > 0 && (
                  <div className="flex justify-between text-xs text-[#A0A4AB]">
                    <span>Pontos EDY-K nesta compra</span>
                    <span className="font-mono-tabular text-[#F4D013] font-semibold">
                      +{pointsToEarn} pts
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleProceedCheckout}
                className="w-full py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
              >
                Finalizar Compra (Pix / Cartão)
              </button>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        title="Checkout da Loja EDY-K"
        subtitle={`${detailedItems.length} item(ns) · ${fulfillment === 'pickup' ? 'Retirada na Barbearia' : 'Entrega'}`}
        amount={total}
        referenceId={orderRef}
        onClose={() => {
          setCheckoutOpen(false);
          if (cart.length === 0) {
            onClose();
            onOrderComplete();
          }
        }}
        onSuccess={handlePaymentApproved}
      />
    </>
  );
};
