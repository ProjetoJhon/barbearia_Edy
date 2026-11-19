import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCheck,
  DollarSign,
  Plus,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { addDays } from '../../data/seedData';
import { AppointmentStatus } from '../../types';
import { formatBRL, formatDateBR, maskPhoneBR } from '../../utils/format';

const STATUS_LABELS: Record<AppointmentStatus, { text: string; color: string }> = {
  pending: { text: 'Pendente', color: 'text-[#F4D013]' },
  confirmed: { text: 'Confirmado', color: 'text-emerald-400' },
  completed: { text: 'Concluído', color: 'text-[#A0A4AB]' },
  cancelled: { text: 'Cancelado', color: 'text-red-400' },
};

export const AdminAgendaTab: React.FC = () => {
  const {
    appointments,
    services,
    barbers,
    updateAppointmentStatus,
    markAppointmentPaid,
    createAppointment,
    isSlotTaken,
    notify,
  } = useStore();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Manual booking form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [barberId, setBarberId] = useState(barbers[0]?.id || '');
  const [date, setDate] = useState(addDays(0));
  const [time, setTime] = useState('10:00');
  const [paidNow, setPaidNow] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments
      .filter((a) => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (barberFilter !== 'all' && a.barberId !== barberFilter) return false;
        if (
          q &&
          !a.clientName.toLowerCase().includes(q) &&
          !a.serviceName.toLowerCase().includes(q) &&
          !a.id.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [appointments, query, statusFilter, barberFilter]);

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const srv = services.find((s) => s.id === serviceId);
    const brb = barbers.find((b) => b.id === barberId);
    if (!srv || !brb) return;
    if (isSlotTaken(brb.id, date, time)) {
      notify(`O barbeiro ${brb.name} já possui agendamento às ${time} nesta data.`, 'error');
      return;
    }
    createAppointment({
      userId: 'walk-in',
      clientName: clientName.trim() || 'Cliente Balcão',
      clientPhone: clientPhone.trim() || '(11) 90000-0000',
      serviceId: srv.id,
      serviceName: srv.name,
      servicePrice: srv.price,
      serviceDuration: srv.durationMinutes,
      barberId: brb.id,
      barberName: brb.name,
      date,
      time,
      status: 'confirmed',
      paymentMethod: paidNow ? 'pix' : 'in_shop',
      paymentStatus: paidNow ? 'paid' : 'pending',
    });
    notify('Agendamento manual lançado na agenda!');
    setModalOpen(false);
    setClientName('');
    setClientPhone('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-[#A0A4AB] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Buscar cliente ou serviço..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-[#2C2E33] bg-[#18191C] pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
            />
          </div>

          <select
            value={barberFilter}
            onChange={(e) => setBarberFilter(e.target.value)}
            className="rounded-xl border border-[#2C2E33] bg-[#18191C] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
          >
            <option value="all">Todos os barbeiros</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | AppointmentStatus)}
            className="rounded-xl border border-[#2C2E33] bg-[#18191C] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agendamento Manual
        </button>
      </div>

      {/* Appointments Table */}
      <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2C2E33] text-xs uppercase tracking-wider text-[#A0A4AB] bg-[#141518]">
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Serviço &amp; Barbeiro</th>
                <th className="py-3.5 px-4">Pagamento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2E33] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#A0A4AB]">
                    Nenhum agendamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => {
                  const st = STATUS_LABELS[apt.status];
                  return (
                    <tr key={apt.id} className="hover:bg-[#222428]/50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono-tabular font-semibold text-white">{apt.time}</div>
                        <div className="text-xs text-[#A0A4AB]">{formatDateBR(apt.date)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{apt.clientName}</div>
                        <div className="text-xs font-mono-tabular text-[#A0A4AB]">{apt.clientPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white">{apt.serviceName}</div>
                        <div className="text-xs text-[#A0A4AB]">{apt.barberName}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono-tabular font-semibold text-[#E2B743]">
                          {formatBRL(apt.servicePrice)}
                        </div>
                        <div className={`text-xs ${apt.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-[#A0A4AB]'}`}>
                          {apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold ${st.color}`}>{st.text}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {apt.status === 'pending' && (
                            <button
                              type="button"
                              title="Confirmar agendamento"
                              onClick={() => {
                                updateAppointmentStatus(apt.id, 'confirmed');
                                notify('Agendamento confirmado.');
                              }}
                              className="p-2 rounded-lg bg-[#222428] text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <button
                              type="button"
                              title="Marcar como concluído"
                              onClick={() => {
                                updateAppointmentStatus(apt.id, 'completed');
                                notify('Atendimento concluído.');
                              }}
                              className="p-2 rounded-lg bg-[#222428] text-[#E2B743] hover:bg-[#E2B743]/20 cursor-pointer"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                          {apt.paymentStatus !== 'paid' && apt.status !== 'cancelled' && (
                            <button
                              type="button"
                              title="Marcar como pago"
                              onClick={() => {
                                markAppointmentPaid(apt.id, 'in_shop');
                                notify('Pagamento registrado.');
                              }}
                              className="p-2 rounded-lg bg-[#222428] text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <button
                              type="button"
                              title="Cancelar agendamento"
                              onClick={() => {
                                updateAppointmentStatus(apt.id, 'cancelled');
                                notify('Agendamento cancelado.', 'info');
                              }}
                              className="p-2 rounded-lg bg-[#222428] text-red-400 hover:bg-red-500/20 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl uppercase text-white">Novo Agendamento Manual</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#A0A4AB] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Henrique"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(maskPhoneBR(e.target.value))}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Serviço</label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatBRL(s.price)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Barbeiro</label>
                  <select
                    value={barberId}
                    onChange={(e) => setBarberId(e.target.value)}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#A0A4AB] pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paidNow}
                  onChange={(e) => setPaidNow(e.target.checked)}
                  className="accent-[#E2B743]"
                />
                Já está pago
              </label>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
              >
                Lançar na Agenda
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
