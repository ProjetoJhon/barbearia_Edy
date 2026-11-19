import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  Scissors,
  Sparkles,
  Store,
  Ticket,
  User as UserIcon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Appointment } from '../types';
import {
  formatBRL,
  formatDateBR,
  generateTimeSlots,
  getDayOfWeekFromISO,
  maskPhoneBR,
} from '../utils/format';
import { CheckoutModal, CheckoutResult } from './CheckoutModal';
import { addDays } from '../data/seedData';

interface BookingFlowProps {
  initialServiceId?: string;
  initialBarberId?: string;
  rescheduleAppointment?: Appointment | null;
  onComplete: () => void;
  onRequireAuth: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  initialServiceId,
  initialBarberId,
  rescheduleAppointment,
  onComplete,
}) => {
  const {
    services,
    barbers,
    settings,
    currentUser,
    loyaltyConfig,
    redeemedRewards,
    getBarberRatingStats,
    calculateServicePoints,
    isSlotTaken,
    createAppointment,
    updateAppointment,
    notify,
  } = useStore();

  const activeServices = services.filter((s) => s.active);
  const activeBarbers = barbers.filter((b) => b.active);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(
    rescheduleAppointment ? 3 : initialServiceId && initialBarberId ? 3 : initialServiceId ? 2 : 1
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    rescheduleAppointment?.serviceId || initialServiceId || activeServices[0]?.id || ''
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    rescheduleAppointment?.barberId || initialBarberId || 'any'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    rescheduleAppointment?.date || addDays(0)
  );
  const [selectedTime, setSelectedTime] = useState<string>(rescheduleAppointment?.time || '');
  const [paymentChoice, setPaymentChoice] = useState<'pix' | 'credit_card' | 'in_shop'>('pix');
  const [guestName, setGuestName] = useState(currentUser?.name || rescheduleAppointment?.clientName || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || rescheduleAppointment?.clientPhone || '');
  const [notes, setNotes] = useState(rescheduleAppointment?.notes || '');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [pendingRefId, setPendingRefId] = useState('');
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string>('');

  const selectedService = activeServices.find((s) => s.id === selectedServiceId) || activeServices[0];

  const availableServiceVouchers = useMemo(() => {
    if (!currentUser || !loyaltyConfig.enabled) return [];
    return redeemedRewards.filter(
      (r) =>
        r.userId === currentUser.id &&
        r.status === 'available' &&
        (r.appliesTo === 'service' || r.appliesTo === 'both')
    );
  }, [currentUser, loyaltyConfig.enabled, redeemedRewards]);

  const appliedVoucher = availableServiceVouchers.find((v) => v.id === selectedRewardId) || null;
  const serviceOriginalPrice = selectedService?.price || 0;
  const discountAmount = appliedVoucher ? Math.min(serviceOriginalPrice, appliedVoucher.discountAmount) : 0;
  const finalServicePrice = Math.max(0, serviceOriginalPrice - discountAmount);
  const pointsToEarn =
    currentUser && !rescheduleAppointment ? calculateServicePoints(finalServicePrice) : 0;

  // Next 14 days
  const dateOptions = useMemo(() => {
    return Array.from({ length: 14 }, (_, idx) => {
      const iso = addDays(idx);
      const dow = getDayOfWeekFromISO(iso);
      const dayConfig = settings.schedule.find((d) => d.dayIndex === dow);
      return {
        iso,
        dow,
        label: formatDateBR(iso),
        isToday: idx === 0,
        closed: dayConfig?.closed ?? false,
        open: dayConfig?.open || '09:00',
        close: dayConfig?.close || '20:00',
      };
    });
  }, [settings.schedule]);

  const currentDateInfo = dateOptions.find((d) => d.iso === selectedDate) || dateOptions[0];

  // Compute slots & availability for selected date and barber (or any barber)
  const slotGrid = useMemo(() => {
    if (!currentDateInfo || currentDateInfo.closed) return [];

    const candidateBarbers =
      selectedBarberId === 'any'
        ? activeBarbers.filter((b) => b.workDays.includes(currentDateInfo.dow))
        : activeBarbers.filter((b) => b.id === selectedBarberId && b.workDays.includes(currentDateInfo.dow));

    if (candidateBarbers.length === 0) return [];

    const start =
      selectedBarberId === 'any'
        ? currentDateInfo.open
        : candidateBarbers[0].startHour > currentDateInfo.open
          ? candidateBarbers[0].startHour
          : currentDateInfo.open;
    const end =
      selectedBarberId === 'any'
        ? currentDateInfo.close
        : candidateBarbers[0].endHour < currentDateInfo.close
          ? candidateBarbers[0].endHour
          : currentDateInfo.close;

    const allSlots = generateTimeSlots(start, end, 30);

    return allSlots.map((time) => {
      const availableBarber = candidateBarbers.find(
        (b) =>
          time >= b.startHour &&
          time < b.endHour &&
          !isSlotTaken(b.id, selectedDate, time, rescheduleAppointment?.id)
      );
      return {
        time,
        available: Boolean(availableBarber),
        assignedBarber: availableBarber || null,
      };
    });
  }, [currentDateInfo, selectedBarberId, activeBarbers, selectedDate, isSlotTaken, rescheduleAppointment?.id]);

  const chosenSlot = slotGrid.find((s) => s.time === selectedTime);
  const resolvedBarber =
    selectedBarberId === 'any'
      ? chosenSlot?.assignedBarber || activeBarbers[0]
      : activeBarbers.find((b) => b.id === selectedBarberId) || activeBarbers[0];

  const finalizeBooking = (method: 'pix' | 'credit_card' | 'in_shop', paid: boolean, installments?: number) => {
    if (!selectedService || !resolvedBarber || !selectedTime) return;

    if (rescheduleAppointment) {
      updateAppointment(rescheduleAppointment.id, {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.durationMinutes,
        barberId: resolvedBarber.id,
        barberName: resolvedBarber.name,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
        notes,
      });
      notify('Agendamento reagendado com sucesso!');
      onComplete();
      return;
    }

    const apt = createAppointment({
      userId: currentUser?.id || 'guest',
      clientName: guestName.trim() || currentUser?.name || 'Cliente EDY-K',
      clientPhone: guestPhone.trim() || currentUser?.phone || '(11) 99999-0000',
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: finalServicePrice,
      originalPrice: serviceOriginalPrice,
      discountApplied: discountAmount > 0 ? discountAmount : undefined,
      appliedRewardId: appliedVoucher?.id,
      serviceDuration: selectedService.durationMinutes,
      barberId: resolvedBarber.id,
      barberName: resolvedBarber.name,
      date: selectedDate,
      time: selectedTime,
      status: paid ? 'confirmed' : 'pending',
      paymentMethod: method,
      paymentStatus: paid ? 'paid' : 'pending',
      installments,
      notes: notes.trim() || undefined,
    });

    setConfirmedApt(apt);
    notify(paid ? 'Horário reservado e pago com sucesso!' : 'Horário reservado! Pagamento na barbearia.');
  };

  const handleConfirmStep4 = () => {
    if (!currentUser && (guestName.trim().length < 2 || guestPhone.replace(/\D/g, '').length < 10)) {
      notify('Informe seu nome e WhatsApp para confirmar o agendamento.', 'error');
      return;
    }
    if (rescheduleAppointment) {
      finalizeBooking(rescheduleAppointment.paymentMethod, rescheduleAppointment.paymentStatus === 'paid');
      return;
    }
    if (paymentChoice === 'in_shop') {
      finalizeBooking('in_shop', false);
    } else {
      setPendingRefId(`EDYK-${Date.now().toString().slice(-6)}`);
      setCheckoutOpen(true);
    }
  };

  const handleCheckoutSuccess = (res: CheckoutResult) => {
    finalizeBooking(res.method, true, res.installments);
  };

  const steps = [
    { num: 1, label: 'Serviço' },
    { num: 2, label: 'Elenco' },
    { num: 3, label: 'Data e Hora' },
    { num: 4, label: rescheduleAppointment ? 'Confirmar' : 'Pagamento' },
  ] as const;

  if (confirmedApt && !checkoutOpen) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 sm:p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#E2B743]/15 border border-[#E2B743]/50 flex items-center justify-center text-[#E2B743]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="font-display text-3xl uppercase text-white mt-5">
            Horário Reservado
          </h1>
          <p className="text-sm text-[#A0A4AB] mt-1.5">
            Seu atendimento na {settings.shopName} está garantido na agenda.
          </p>

          <div className="mt-6 rounded-xl border border-[#2C2E33] bg-[#0D0E10] p-5 text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A0A4AB]">Serviço</span>
              <span className="font-semibold text-white">{confirmedApt.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A4AB]">Profissional</span>
              <span className="text-white">{confirmedApt.barberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A4AB]">Data e Horário</span>
              <span className="font-mono-tabular text-[#E2B743] font-semibold">
                {formatDateBR(confirmedApt.date)} · {confirmedApt.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A4AB]">Pagamento</span>
              <span className={confirmedApt.paymentStatus === 'paid' ? 'text-emerald-400 font-semibold' : 'text-[#F4D013] font-semibold'}>
                {confirmedApt.paymentStatus === 'paid'
                  ? `Pago (${confirmedApt.paymentMethod === 'pix' ? 'Pix' : 'Cartão'})`
                  : 'Pagar na Barbearia'}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#2C2E33] pt-3">
              <span className="text-[#A0A4AB]">Valor</span>
              <span className="font-mono-tabular font-bold text-white">{formatBRL(confirmedApt.servicePrice)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="mt-6 w-full py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
          >
            Ir para Meus Agendamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">
          {rescheduleAppointment ? 'Reagendamento Inteligente' : 'Reserva Online'}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
          {rescheduleAppointment ? 'Escolha Nova Data e Horário' : 'Agende Seu Horário'}
        </h1>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {steps.map((s) => {
          const active = step === s.num;
          const done = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              disabled={s.num > step && !(s.num === 2 && selectedServiceId) && !(s.num === 3 && selectedServiceId)}
              onClick={() => {
                if (s.num <= step) setStep(s.num);
              }}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                active
                  ? 'border-[#E2B743] bg-[#E2B743]/10 text-white'
                  : done
                    ? 'border-[#2C2E33] bg-[#18191C] text-[#E2B743]'
                    : 'border-[#2C2E33] bg-[#18191C] text-[#A0A4AB]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  active
                    ? 'bg-[#E2B743] text-[#0D0E10]'
                    : done
                      ? 'bg-[#E2B743]/20 text-[#E2B743]'
                      : 'bg-[#222428] text-[#A0A4AB]'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : s.num}
              </span>
              <span className="text-xs sm:text-sm font-medium truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: SERVICE */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeServices.map((srv) => {
              const selected = srv.id === selectedServiceId;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    setStep(2);
                  }}
                  className={`text-left rounded-2xl border p-5 transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#E2B743] bg-[#E2B743]/10'
                      : 'border-[#2C2E33] bg-[#18191C] hover:border-[#E2B743]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#A0A4AB]">
                        {srv.category} · {srv.durationMinutes} min
                      </div>
                      <h3 className="font-display text-xl uppercase text-white mt-0.5">{srv.name}</h3>
                    </div>
                    <span className="font-mono-tabular text-lg font-bold text-[#E2B743] shrink-0">
                      {formatBRL(srv.price)}
                    </span>
                  </div>
                  <p className="text-sm text-[#A0A4AB] mt-2.5 leading-relaxed">{srv.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: BARBER */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sem preferência */}
            <button
              type="button"
              onClick={() => {
                setSelectedBarberId('any');
                setSelectedTime('');
                setStep(3);
              }}
              className={`rounded-2xl border p-5 text-left flex flex-col justify-between transition-colors cursor-pointer ${
                selectedBarberId === 'any'
                  ? 'border-[#E2B743] bg-[#E2B743]/10'
                  : 'border-[#2C2E33] bg-[#18191C] hover:border-[#E2B743]/50'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#222428] border border-[#2C2E33] flex items-center justify-center text-[#E2B743] mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl uppercase text-white">Sem Preferência</h3>
                <p className="text-xs text-[#A0A4AB] mt-2 leading-relaxed">
                  Alocamos automaticamente o primeiro barbeiro disponível do elenco no horário escolhido.
                </p>
              </div>
              <span className="mt-5 text-xs font-semibold text-[#E2B743]">Mais horários livres →</span>
            </button>

            {activeBarbers.map((barber) => {
              const selected = selectedBarberId === barber.id;
              const stats = getBarberRatingStats(barber.id, barber.rating);
              return (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => {
                    setSelectedBarberId(barber.id);
                    setSelectedTime('');
                    setStep(3);
                  }}
                  className={`rounded-2xl border overflow-hidden text-left flex flex-col transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#E2B743] bg-[#E2B743]/10'
                      : 'border-[#2C2E33] bg-[#18191C] hover:border-[#E2B743]/50'
                  }`}
                >
                  <div className="aspect-[4/3] w-full bg-[#0D0E10] overflow-hidden">
                    <img
                      src={barber.photo}
                      alt={barber.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg uppercase text-white">{barber.name}</h3>
                      <p className="text-xs text-[#A0A4AB] mt-0.5">{barber.specialty}</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-[#2C2E33] flex items-center justify-between text-xs">
                      <span className="text-[#F4D013] font-semibold tabular-nums">
                        ★ {stats.average.toFixed(2)}
                      </span>
                      <span className="font-mono-tabular text-[#A0A4AB]">
                        {barber.startHour}–{barber.endHour}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 text-sm text-[#A0A4AB] hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Serviços
          </button>
        </div>
      )}

      {/* STEP 3: DATE & TIME */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
            <h2 className="font-display text-lg uppercase text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E2B743]" />
              Escolha a Data
            </h2>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {dateOptions.map((d) => {
                const active = d.iso === selectedDate;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    disabled={d.closed}
                    onClick={() => {
                      setSelectedDate(d.iso);
                      setSelectedTime('');
                    }}
                    className={`min-w-[92px] rounded-xl border px-3 py-3 text-center transition-colors shrink-0 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                      active
                        ? 'border-[#E2B743] bg-[#E2B743] text-[#0D0E10]'
                        : 'border-[#2C2E33] bg-[#222428] text-white hover:border-[#E2B743]/60'
                    }`}
                  >
                    <div className={`text-[11px] uppercase font-semibold ${active ? 'text-[#0D0E10]/80' : 'text-[#A0A4AB]'}`}>
                      {d.isToday ? 'Hoje' : d.label.split(',')[0]}
                    </div>
                    <div className="font-display text-lg font-bold mt-0.5 tabular-nums">
                      {d.label.split(',')[1]?.trim()}
                    </div>
                    {d.closed && <div className="text-[10px] text-red-400 mt-0.5">Fechado</div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="font-display text-lg uppercase text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E2B743]" />
                Horários Disponíveis
              </h2>
              <span className="text-xs text-[#A0A4AB]">
                Horários já reservados são bloqueados automaticamente
              </span>
            </div>

            {slotGrid.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-[#2C2E33] bg-[#0D0E10]">
                <p className="text-sm text-white font-medium">
                  Sem horários disponíveis para este profissional nesta data.
                </p>
                <p className="text-xs text-[#A0A4AB] mt-1">
                  Selecione outro dia acima ou escolha "Sem preferência" no elenco.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                {slotGrid.map((slot) => {
                  const active = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-3 px-2 rounded-xl border font-mono-tabular text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                        !slot.available
                          ? 'border-[#2C2E33]/60 bg-[#0D0E10] text-[#555961] line-through'
                          : active
                            ? 'border-[#E2B743] bg-[#E2B743] text-[#0D0E10]'
                            : 'border-[#2C2E33] bg-[#222428] text-white hover:border-[#E2B743]'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 text-sm text-[#A0A4AB] hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="button"
              disabled={!selectedTime}
              onClick={() => setStep(4)}
              className="px-7 py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Continuar para Resumo
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT OR RESERVE */}
      {step === 4 && selectedService && resolvedBarber && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            {/* Client Contact Info if guest */}
            {!currentUser && (
              <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg uppercase text-white">Seus Dados</h2>
                  <span className="text-xs text-[#A0A4AB]">Sem burocracia</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs text-[#A0A4AB] mb-1">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A0A4AB] mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(maskPhoneBR(e.target.value))}
                      className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Options */}
            {!rescheduleAppointment && (
              <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6 space-y-3">
                <h2 className="font-display text-lg uppercase text-white mb-2">Forma de Pagamento</h2>
                {[
                  {
                    id: 'pix' as const,
                    title: 'Pagar Online via Pix',
                    desc: 'Confirmação instantânea com QR Code e Pix Copia e Cola',
                    icon: QrCode,
                  },
                  {
                    id: 'credit_card' as const,
                    title: 'Pagar Online no Cartão de Crédito',
                    desc: 'Parcele sem juros com aprovação imediata',
                    icon: CreditCard,
                  },
                  {
                    id: 'in_shop' as const,
                    title: 'Pagar na Barbearia',
                    desc: 'Reserve agora e pague presencialmente após o corte',
                    icon: Store,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentChoice === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentChoice(opt.id)}
                      className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#E2B743] bg-[#E2B743]/10'
                          : 'border-[#2C2E33] bg-[#222428] hover:border-[#E2B743]/50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          active ? 'bg-[#E2B743] text-[#0D0E10]' : 'bg-[#0D0E10] text-[#E2B743]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white">{opt.title}</div>
                        <div className="text-xs text-[#A0A4AB] mt-0.5">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
              <label className="block text-xs font-medium text-[#A0A4AB] mb-1.5">
                Observações para o barbeiro (opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Degradê navalhado baixo, manter volume no topo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 text-sm text-[#A0A4AB] hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Alterar data ou horário
            </button>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 space-y-5">
              <h2 className="font-display text-xl uppercase text-white">Resumo da Reserva</h2>
              <div className="space-y-3.5 text-sm">
                <div className="flex items-start gap-3">
                  <Scissors className="w-4 h-4 text-[#E2B743] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-white font-semibold">{selectedService.name}</div>
                    <div className="text-xs text-[#A0A4AB]">{selectedService.durationMinutes} minutos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-[#E2B743] shrink-0" />
                  <span className="text-white">{resolvedBarber.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#E2B743] shrink-0" />
                  <span className="font-mono-tabular text-white">
                    {formatDateBR(selectedDate)} às <strong className="text-[#E2B743]">{selectedTime}</strong>
                  </span>
                </div>
              </div>

              {/* Loyalty Voucher Selector */}
              {!rescheduleAppointment && availableServiceVouchers.length > 0 && (
                <div className="border-t border-[#2C2E33] pt-4 space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[#E2B743]">
                    <Ticket className="w-3.5 h-3.5" />
                    Cupom de Fidelidade Disponível
                  </label>
                  <select
                    value={selectedRewardId}
                    onChange={(e) => setSelectedRewardId(e.target.value)}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-xs text-white focus:border-[#E2B743] focus:outline-none"
                  >
                    <option value="">Não usar recompensa agora</option>
                    {availableServiceVouchers.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.code} — {v.rewardTitle} (-{formatBRL(v.discountAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-t border-[#2C2E33] pt-4 space-y-2">
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span>Desconto Fidelidade</span>
                    <span className="font-mono-tabular">-{formatBRL(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A0A4AB]">Total</span>
                  <span className="font-mono-tabular text-2xl font-bold text-[#E2B743]">
                    {formatBRL(finalServicePrice)}
                  </span>
                </div>
                {pointsToEarn > 0 && (
                  <div className="text-xs text-[#A0A4AB] flex items-center justify-between">
                    <span>Pontos EDY-K nesta reserva</span>
                    <span className="font-mono-tabular font-semibold text-[#F4D013]">
                      +{pointsToEarn} pts
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirmStep4}
                className="w-full py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
              >
                {rescheduleAppointment
                  ? 'Confirmar Reagendamento'
                  : paymentChoice === 'in_shop'
                    ? 'Confirmar Reserva'
                    : `Ir para Pagamento (${paymentChoice === 'pix' ? 'Pix' : 'Cartão'})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedService && (
        <CheckoutModal
          open={checkoutOpen}
          title="Pagamento do Agendamento"
          subtitle={`${selectedService.name} · ${formatDateBR(selectedDate)} às ${selectedTime}`}
          amount={finalServicePrice}
          referenceId={pendingRefId}
          initialTab={paymentChoice === 'credit_card' ? 'credit_card' : 'pix'}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};
