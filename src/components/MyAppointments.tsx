import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Clock,
  CreditCard,
  Package,
  RefreshCw,
  Scissors,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Appointment } from '../types';
import { formatBRL, formatDateBR } from '../utils/format';
import { CheckoutModal, CheckoutResult } from './CheckoutModal';

interface MyAppointmentsProps {
  onNewBooking: () => void;
  onReschedule: (apt: Appointment) => void;
  onOpenShop: () => void;
  onOpenRewards: () => void;
}

const STATUS_META: Record<Appointment['status'], { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-[#F4D013]' },
  confirmed: { label: 'Confirmado', color: 'text-emerald-400' },
  completed: { label: 'Concluído', color: 'text-[#A0A4AB]' },
  cancelled: { label: 'Cancelado', color: 'text-red-400' },
};

const StarPicker: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-medium text-[#A0A4AB]">{label}</span>
      <span className="font-mono-tabular text-xs font-semibold text-[#F4D013]">{value}.0 / 5.0</span>
    </div>
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} estrela(s) para ${label}`}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-[#2C2E33] bg-[#222428] hover:border-[#E2B743] transition-colors cursor-pointer"
        >
          <Star
            className={`w-5 h-5 ${
              star <= value ? 'text-[#F4D013] fill-current' : 'text-[#555961]'
            }`}
          />
        </button>
      ))}
    </div>
  </div>
);

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  onNewBooking,
  onReschedule,
  onOpenShop,
  onOpenRewards,
}) => {
  const {
    currentUser,
    appointments,
    orders,
    reviews,
    getUserPoints,
    updateAppointmentStatus,
    markAppointmentPaid,
    submitReview,
    notify,
  } = useStore();

  const [tab, setTab] = useState<'bookings' | 'orders'>('bookings');
  const [payingApt, setPayingApt] = useState<Appointment | null>(null);
  const [reviewingApt, setReviewingApt] = useState<Appointment | null>(null);
  const [serviceRating, setServiceRating] = useState(5);
  const [barberRating, setBarberRating] = useState(5);
  const [comment, setComment] = useState('');

  const userAppointments = appointments.filter((a) =>
    currentUser ? a.userId === currentUser.id || currentUser.role === 'admin' : a.userId === 'guest'
  );

  const userOrders = orders.filter((o) =>
    currentUser ? o.userId === currentUser.id || currentUser.role === 'admin' : o.userId === 'guest'
  );

  const pointsBalance = currentUser ? getUserPoints(currentUser.id) : 0;

  const handleCancel = (apt: Appointment) => {
    updateAppointmentStatus(apt.id, 'cancelled');
    notify('Agendamento cancelado e horário liberado na agenda.', 'info');
  };

  const handlePaySuccess = (res: CheckoutResult) => {
    if (!payingApt) return;
    markAppointmentPaid(payingApt.id, res.method, res.installments);
    notify('Pagamento confirmado! Status atualizado para Pago.');
  };

  const openReviewModal = (apt: Appointment) => {
    setReviewingApt(apt);
    setServiceRating(5);
    setBarberRating(5);
    setComment('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApt) return;
    if (comment.trim().length < 4) {
      notify('Escreva um breve comentário sobre seu atendimento.', 'error');
      return;
    }
    submitReview({
      appointmentId: reviewingApt.id,
      barberId: reviewingApt.barberId,
      barberName: reviewingApt.barberName,
      serviceId: reviewingApt.serviceId,
      serviceName: reviewingApt.serviceName,
      serviceRating,
      barberRating,
      comment: comment.trim(),
    });
    setReviewingApt(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">
            Área do Cliente
          </p>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
            Meus Agendamentos
          </h1>
          <p className="text-sm text-[#A0A4AB] mt-1">
            {currentUser
              ? `Histórico, avaliações e reservas de ${currentUser.name}.`
              : 'Visualize suas reservas recentes ou entre na sua conta para sincronizar.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onNewBooking}
          className="px-5 py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-xs uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          + Novo Agendamento
        </button>
      </div>

      {/* Loyalty Rewards Shortcut Strip */}
      {currentUser && (
        <div className="mb-6 rounded-2xl border border-[#E2B743]/35 bg-[#18191C] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E2B743]/15 border border-[#E2B743]/40 flex items-center justify-center text-[#E2B743] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#A0A4AB]">Programa de Fidelidade EDY-K</div>
              <div className="text-sm font-semibold text-white">
                Você possui <span className="font-mono-tabular text-[#E2B743]">{pointsBalance} pontos</span> acumulados
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenRewards}
            className="px-4 py-2 rounded-xl border border-[#E2B743]/50 bg-[#E2B743]/10 text-xs font-bold uppercase tracking-wider text-[#E2B743] hover:bg-[#E2B743] hover:text-[#0D0E10] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Abrir Meus Prêmios
          </button>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="inline-flex gap-1 p-1 rounded-xl bg-[#18191C] border border-[#2C2E33] mb-6">
        <button
          type="button"
          onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'bookings' ? 'bg-[#E2B743] text-[#0D0E10]' : 'text-[#A0A4AB] hover:text-white'
          }`}
        >
          Agendamentos ({userAppointments.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'orders' ? 'bg-[#E2B743] text-[#0D0E10]' : 'text-[#A0A4AB] hover:text-white'
          }`}
        >
          Pedidos da Loja ({userOrders.length})
        </button>
      </div>

      {tab === 'bookings' ? (
        userAppointments.length === 0 ? (
          <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] py-16 px-4 text-center">
            <Scissors className="w-10 h-10 text-[#A0A4AB] mx-auto mb-3" />
            <h2 className="font-display text-xl uppercase text-white">Nenhum horário agendado</h2>
            <p className="text-sm text-[#A0A4AB] mt-1">
              Reserve seu próximo corte ou barba terapia em poucos cliques.
            </p>
            <button
              type="button"
              onClick={onNewBooking}
              className="mt-5 px-6 py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] text-sm font-bold uppercase tracking-wider cursor-pointer"
            >
              Agendar Agora
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userAppointments.map((apt) => {
              const statusInfo = STATUS_META[apt.status];
              const canModify = apt.status === 'pending' || apt.status === 'confirmed';
              const existingReview = reviews.find((r) => r.appointmentId === apt.id);

              return (
                <div
                  key={apt.id}
                  className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                        <span className="text-[#555961]" aria-hidden="true">·</span>
                        <span className={apt.paymentStatus === 'paid' ? 'text-emerald-400 font-medium' : 'text-[#A0A4AB]'}>
                          {apt.paymentStatus === 'paid'
                            ? `Pago (${apt.paymentMethod === 'pix' ? 'Pix' : 'Cartão'})`
                            : 'Pagamento pendente / na barbearia'}
                        </span>
                        <span className="text-[#555961]" aria-hidden="true">·</span>
                        <span className="font-mono-tabular text-[#A0A4AB]">#{apt.id.toUpperCase()}</span>
                        {apt.pointsEarned && apt.pointsEarned > 0 && apt.status !== 'cancelled' && (
                          <>
                            <span className="text-[#555961]" aria-hidden="true">·</span>
                            <span className="font-mono-tabular text-[#E2B743] font-semibold">
                              +{apt.pointsEarned} pts
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-2xl uppercase text-white">{apt.serviceName}</h3>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[#A0A4AB]">
                        <span className="inline-flex items-center gap-1.5 text-white">
                          <Calendar className="w-4 h-4 text-[#E2B743]" />
                          {formatDateBR(apt.date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono-tabular text-white">
                          <Clock className="w-4 h-4 text-[#E2B743]" />
                          {apt.time} ({apt.serviceDuration} min)
                        </span>
                        <span>Barbeiro: <strong className="text-white">{apt.barberName}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-[#2C2E33] pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        {apt.discountApplied && apt.discountApplied > 0 && (
                          <span className="block text-xs text-emerald-400 font-mono-tabular">
                            Desconto aplicado: -{formatBRL(apt.discountApplied)}
                          </span>
                        )}
                        <div className="font-mono-tabular text-xl font-bold text-[#E2B743]">
                          {formatBRL(apt.servicePrice)}
                        </div>
                      </div>

                      {canModify && (
                        <div className="flex flex-wrap items-center gap-2">
                          {apt.paymentStatus !== 'paid' && (
                            <button
                              type="button"
                              onClick={() => setPayingApt(apt)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E2B743] text-[#0D0E10] text-xs font-bold hover:bg-[#C89D2B] transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pagar Online
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onReschedule(apt)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#2C2E33] bg-[#222428] text-xs font-semibold text-white hover:border-[#E2B743] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-[#E2B743]" />
                            Reagendar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(apt)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        </div>
                      )}

                      {apt.status === 'completed' && !existingReview && (
                        <button
                          type="button"
                          onClick={() => openReviewModal(apt)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Avaliar Atendimento
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submitted Review Preview */}
                  {existingReview && (
                    <div className="rounded-xl border border-[#2C2E33] bg-[#0D0E10] p-4 text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#E2B743]">Sua avaliação publicada</span>
                        <span className="font-mono-tabular text-[#F4D013]">
                          Serviço {existingReview.serviceRating}★ · Barbeiro {existingReview.barberRating}★
                        </span>
                      </div>
                      <p className="text-sm text-white leading-relaxed">"{existingReview.comment}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : userOrders.length === 0 ? (
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] py-16 px-4 text-center">
          <Package className="w-10 h-10 text-[#A0A4AB] mx-auto mb-3" />
          <h2 className="font-display text-xl uppercase text-white">Nenhum pedido realizado</h2>
          <p className="text-sm text-[#A0A4AB] mt-1">
            Conheça nossa linha de pomadas, óleos para barba e kits exclusivos.
          </p>
          <button
            type="button"
            onClick={onOpenShop}
            className="mt-5 px-6 py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] text-sm font-bold uppercase tracking-wider cursor-pointer"
          >
            Visitar Loja
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2C2E33] pb-3">
                <div className="text-xs text-[#A0A4AB]">
                  <span className="font-mono-tabular text-white font-semibold">#{order.id.toUpperCase()}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{order.fulfillment === 'pickup' ? 'Retirada na barbearia' : 'Entrega'}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-medium">
                    Pago ({order.paymentMethod === 'pix' ? 'Pix' : 'Cartão'})
                  </span>
                  {order.pointsEarned && order.pointsEarned > 0 && (
                    <>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="font-mono-tabular text-[#E2B743] font-semibold">
                        +{order.pointsEarned} pts
                      </span>
                    </>
                  )}
                </div>
                <div className="font-mono-tabular text-lg font-bold text-[#E2B743]">
                  {formatBRL(order.total)}
                </div>
              </div>

              <div className="space-y-2.5">
                {order.items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={it.image}
                        alt={it.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover bg-[#0D0E10] shrink-0"
                      />
                      <span className="text-white truncate">
                        {it.quantity}x {it.name}
                      </span>
                    </div>
                    <span className="font-mono-tabular text-[#A0A4AB] shrink-0">
                      {formatBRL(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating & Review Modal */}
      {reviewingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display text-xl uppercase text-white">Avaliar Atendimento</h2>
                <p className="text-xs text-[#A0A4AB] mt-0.5">
                  {reviewingApt.serviceName} · {reviewingApt.barberName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewingApt(null)}
                aria-label="Fechar modal"
                className="p-1.5 rounded-lg text-[#A0A4AB] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              <StarPicker
                label={`Nota para o Serviço (${reviewingApt.serviceName})`}
                value={serviceRating}
                onChange={setServiceRating}
              />

              <StarPicker
                label={`Nota para o Barbeiro (${reviewingApt.barberName})`}
                value={barberRating}
                onChange={setBarberRating}
              />

              <div>
                <label className="block text-xs font-medium text-[#A0A4AB] mb-1.5">
                  Seu comentário
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Conte como foi o corte, acabamento e atendimento..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
              >
                Publicar Avaliação
              </button>
            </form>
          </div>
        </div>
      )}

      {payingApt && (
        <CheckoutModal
          open={Boolean(payingApt)}
          title="Quitar Agendamento"
          subtitle={`${payingApt.serviceName} · ${formatDateBR(payingApt.date)} às ${payingApt.time}`}
          amount={payingApt.servicePrice}
          referenceId={payingApt.id}
          onClose={() => setPayingApt(null)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
};
