import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Lock,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  buildPixPayload,
  detectCardBrand,
  formatBRL,
  maskCardNumber,
  maskExpiry,
} from '../utils/format';

export interface CheckoutResult {
  method: 'pix' | 'credit_card';
  installments?: number;
}

interface CheckoutModalProps {
  open: boolean;
  title: string;
  subtitle: string;
  amount: number;
  referenceId: string;
  initialTab?: 'pix' | 'credit_card';
  onClose: () => void;
  onSuccess: (result: CheckoutResult) => void;
}

const PixQRCodeSVG: React.FC<{ seed: string }> = ({ seed }) => {
  // Deterministic 21x21 QR matrix with valid 3 corner finder patterns
  const cells = useMemo(() => {
    const size = 21;
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const isFinder = (r: number, c: number) => {
      const inTL = r < 7 && c < 7;
      const inTR = r < 7 && c >= size - 7;
      const inBL = r >= size - 7 && c < 7;
      if (!inTL && !inTR && !inBL) return null;
      const lr = inBL ? r - (size - 7) : r;
      const lc = inTR ? c - (size - 7) : c;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };

    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        const finder = isFinder(r, c);
        if (finder !== null) {
          row.push(finder);
        } else if (
          (r === 7 && (c < 8 || c >= size - 8)) ||
          (c === 7 && (r < 8 || r >= size - 8))
        ) {
          row.push(false);
        } else {
          hash = Math.imul(hash ^ (r * 31 + c * 17 + 7), 16777619);
          row.push(((hash >>> 24) & 1) === 1);
        }
      }
      grid.push(row);
    }
    return grid;
  }, [seed]);

  return (
    <svg
      viewBox="0 0 21 21"
      className="w-44 h-44 rounded-lg bg-white p-2.5 shadow-inner"
      shapeRendering="crispEdges"
      aria-label="QR Code Pix"
    >
      <rect width="21" height="21" fill="#FFFFFF" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0D0E10" /> : null
        )
      )}
    </svg>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  title,
  subtitle,
  amount,
  referenceId,
  initialTab = 'pix',
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'pix' | 'credit_card'>(initialTab);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [approved, setApproved] = useState<CheckoutResult | null>(null);

  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [cardError, setCardError] = useState('');

  const pixPayload = useMemo(() => buildPixPayload(amount, referenceId), [amount, referenceId]);
  const cardBrand = detectCardBrand(cardNumber);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setSecondsLeft(15 * 60);
    setCopied(false);
    setProcessing(false);
    setApproved(null);
    setCardError('');
  }, [open, initialTab, referenceId]);

  useEffect(() => {
    if (!open || approved || tab !== 'pix') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, approved, tab]);

  if (!open) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = pixPayload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  const handleSimulatePix = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const result: CheckoutResult = { method: 'pix' };
      setProcessing(false);
      setApproved(result);
      onSuccess(result);
    }, 650);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = cardNumber.replace(/\D/g, '');
    if (cleanDigits.length < 13) {
      setCardError('Informe um número de cartão válido (mínimo 13 dígitos).');
      return;
    }
    if (cardHolder.trim().length < 3) {
      setCardError('Informe o nome impresso no cartão.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError('Informe a validade no formato MM/AA.');
      return;
    }
    if (cardCvv.replace(/\D/g, '').length < 3) {
      setCardError('Informe o código de segurança (CVV).');
      return;
    }
    setCardError('');
    setProcessing(true);
    window.setTimeout(() => {
      const result: CheckoutResult = { method: 'credit_card', installments };
      setProcessing(false);
      setApproved(result);
      onSuccess(result);
    }, 800);
  };

  const maxInstallments = amount >= 120 ? 6 : amount >= 60 ? 3 : 2;
  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[#2C2E33] bg-[#18191C] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2C2E33] bg-[#18191C]/95 backdrop-blur-md px-5 py-4">
          <div>
            <h2 className="font-display text-lg uppercase text-white tracking-wide">{title}</h2>
            <p className="text-xs text-[#A0A4AB] mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar checkout"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#A0A4AB] hover:text-white hover:bg-[#222428] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {approved ? (
            <div className="py-6 text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="font-display text-2xl uppercase text-white">Pagamento Aprovado</h3>
                <p className="text-sm text-[#A0A4AB] mt-1.5">
                  Transação confirmada instantaneamente e status atualizado para <strong className="text-emerald-400">Pago</strong>.
                </p>
              </div>
              <div className="rounded-xl border border-[#2C2E33] bg-[#0D0E10] p-4 text-left space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A0A4AB]">Referência</span>
                  <span className="font-mono-tabular text-white">{referenceId.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0A4AB]">Forma de Pagamento</span>
                  <span className="text-white font-medium">
                    {approved.method === 'pix'
                      ? 'Pix Instantâneo'
                      : `Cartão de Crédito (${approved.installments || 1}x sem juros)`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#2C2E33] pt-2.5">
                  <span className="text-[#A0A4AB]">Valor Total</span>
                  <span className="font-mono-tabular font-bold text-[#E2B743]">{formatBRL(amount)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
              >
                Concluir e Visualizar
              </button>
            </div>
          ) : (
            <>
              {/* Total Strip */}
              <div className="flex items-center justify-between rounded-xl border border-[#2C2E33] bg-[#0D0E10] px-4 py-3 mb-5">
                <span className="text-xs uppercase tracking-wider text-[#A0A4AB] font-medium">Total a pagar</span>
                <span className="font-mono-tabular text-xl font-bold text-[#E2B743]">{formatBRL(amount)}</span>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0D0E10] border border-[#2C2E33] mb-5">
                <button
                  type="button"
                  onClick={() => setTab('pix')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    tab === 'pix'
                      ? 'bg-[#E2B743] text-[#0D0E10]'
                      : 'text-[#A0A4AB] hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  Pix Instantâneo
                </button>
                <button
                  type="button"
                  onClick={() => setTab('credit_card')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    tab === 'credit_card'
                      ? 'bg-[#E2B743] text-[#0D0E10]'
                      : 'text-[#A0A4AB] hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  Cartão de Crédito
                </button>
              </div>

              {tab === 'pix' ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center rounded-xl border border-[#2C2E33] bg-[#0D0E10] p-5">
                    <PixQRCodeSVG seed={pixPayload} />
                    <div className="mt-3.5 flex items-center gap-2 text-xs text-[#A0A4AB]">
                      <Clock className="w-3.5 h-3.5 text-[#E2B743]" />
                      <span>Expira em</span>
                      <span className="font-mono-tabular font-semibold text-white">
                        {mins}:{secs}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A0A4AB] mb-1.5">
                      Pix Copia e Cola
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixPayload}
                        className="flex-1 rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2.5 text-xs font-mono-tabular text-[#A0A4AB] truncate focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleCopyPix()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#222428] border border-[#2C2E33] text-xs font-semibold text-white hover:border-[#E2B743] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E2B743]" />}
                        {copied ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleSimulatePix}
                    className="w-full py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {processing ? 'Confirmando pagamento...' : 'Simular Pagamento Aprovado'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  {/* Interactive Live Credit Card Preview */}
                  <div className="perspective-1000 w-full h-44 mx-auto">
                    <div
                      className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
                        cvvFocused ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front */}
                      <div className="absolute inset-0 backface-hidden rounded-2xl border border-[#E2B743]/40 bg-gradient-to-br from-[#23252A] via-[#15161A] to-[#0D0E10] p-5 flex flex-col justify-between shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#F4D013] to-[#9E7517] opacity-90" />
                          <span className="font-display text-sm tracking-widest text-[#E2B743] uppercase">
                            {cardBrand}
                          </span>
                        </div>
                        <div className="font-mono-tabular text-lg sm:text-xl tracking-[0.18em] text-white">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex items-end justify-between text-xs">
                          <div className="min-w-0 pr-3">
                            <span className="block text-[10px] uppercase text-[#A0A4AB]">Titular</span>
                            <span className="block truncate font-semibold uppercase tracking-wider text-white">
                              {cardHolder || 'NOME NO CARTÃO'}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-[10px] uppercase text-[#A0A4AB]">Validade</span>
                            <span className="font-mono-tabular font-semibold text-white">
                              {cardExpiry || 'MM/AA'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Back */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-[#E2B743]/40 bg-gradient-to-br from-[#1B1D22] to-[#0D0E10] py-5 flex flex-col justify-between shadow-xl">
                        <div className="w-full h-10 bg-black/90" />
                        <div className="px-5">
                          <span className="block text-[10px] uppercase text-[#A0A4AB] mb-1">Código de Segurança (CVV)</span>
                          <div className="h-9 rounded bg-[#222428] border border-[#2C2E33] px-3 flex items-center justify-end font-mono-tabular text-sm tracking-widest text-[#E2B743]">
                            {cardCvv || '•••'}
                          </div>
                        </div>
                        <div className="px-5 text-[10px] text-[#A0A4AB] flex items-center justify-between">
                          <span>EDY-K PAY AMBIENTE SEGURO</span>
                          <span>{cardBrand}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {cardError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
                      {cardError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#A0A4AB] mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                        className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm font-mono-tabular text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#A0A4AB] mb-1">Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        placeholder="EX: LUCAS FERREIRA"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm uppercase text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#A0A4AB] mb-1">Validade</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(maskExpiry(e.target.value))}
                          className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm font-mono-tabular text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#A0A4AB] mb-1">CVV</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvv}
                          onFocus={() => setCvvFocused(true)}
                          onBlur={() => setCvvFocused(false)}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm font-mono-tabular text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#A0A4AB] mb-1">Parcelamento</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                      >
                        {installmentOptions.map((n) => (
                          <option key={n} value={n} className="bg-[#18191C]">
                            {n}x de {formatBRL(amount / n)} sem juros
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    {processing ? 'Autorizando cartão...' : `Pagar ${formatBRL(amount)}`}
                  </button>
                </form>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#A0A4AB]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E2B743]" />
                <span>Ambiente protegido · Aprovação imediata EDY-K Barbershop</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
