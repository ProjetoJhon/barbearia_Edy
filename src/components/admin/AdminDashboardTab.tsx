import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { addDays } from '../../data/seedData';
import { formatBRL, formatDateBR } from '../../utils/format';

export const AdminDashboardTab: React.FC<{ onGoToAgenda: () => void }> = ({ onGoToAgenda }) => {
  const { appointments, orders, users, products } = useStore();
  const todayISO = addDays(0);

  const metrics = useMemo(() => {
    const validApts = appointments.filter((a) => a.status !== 'cancelled');
    const serviceRevenue = validApts.reduce((sum, a) => sum + a.servicePrice, 0);
    const productRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    const todayApts = validApts.filter((a) => a.date === todayISO);
    const totalClients = users.filter((u) => u.role === 'client').length;
    return {
      totalRevenue: serviceRevenue + productRevenue,
      serviceRevenue,
      productRevenue,
      todayCount: todayApts.length,
      todayApts,
      totalClients,
    };
  }, [appointments, orders, users, todayISO]);

  // Last 7 days chart data
  const revenueByDay = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => {
      const iso = addDays(idx - 5);
      const dayServices = appointments
        .filter((a) => a.date === iso && a.status !== 'cancelled')
        .reduce((s, a) => s + a.servicePrice, 0);
      const dayProducts = orders
        .filter((o) => o.createdAt === iso && o.status !== 'cancelled')
        .reduce((s, o) => s + o.total, 0);
      return {
        label: formatDateBR(iso).split(',')[0] + ' ' + iso.slice(8),
        Servicos: dayServices,
        Produtos: Number(dayProducts.toFixed(2)),
      };
    });
  }, [appointments, orders]);

  // Top services breakdown
  const topServices = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number }>();
    appointments
      .filter((a) => a.status !== 'cancelled')
      .forEach((a) => {
        const cur = map.get(a.serviceName) || { name: a.serviceName, count: 0, total: 0 };
        cur.count += 1;
        cur.total += a.servicePrice;
        map.set(a.serviceName, cur);
      });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [appointments]);

  const lowStockProducts = products.filter((p) => p.active && p.stock <= 5);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0A4AB]">
            <span>Faturamento Total</span>
            <DollarSign className="w-4 h-4 text-[#E2B743]" />
          </div>
          <div className="mt-3 font-mono-tabular text-2xl font-bold text-[#E2B743]">
            {formatBRL(metrics.totalRevenue)}
          </div>
          <div className="mt-1.5 text-xs text-[#A0A4AB] font-mono-tabular">
            Serviços {formatBRL(metrics.serviceRevenue)}
          </div>
        </div>

        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0A4AB]">
            <span>Agendamentos Hoje</span>
            <Calendar className="w-4 h-4 text-[#E2B743]" />
          </div>
          <div className="mt-3 font-mono-tabular text-2xl font-bold text-white">
            {metrics.todayCount}
          </div>
          <div className="mt-1.5 text-xs text-[#A0A4AB]">
            {formatDateBR(todayISO)}
          </div>
        </div>

        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0A4AB]">
            <span>Vendas da Loja</span>
            <ShoppingBag className="w-4 h-4 text-[#E2B743]" />
          </div>
          <div className="mt-3 font-mono-tabular text-2xl font-bold text-white">
            {formatBRL(metrics.productRevenue)}
          </div>
          <div className="mt-1.5 text-xs text-[#A0A4AB] tabular-nums">
            {orders.length} pedido(s) registrados
          </div>
        </div>

        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
          <div className="flex items-center justify-between text-xs text-[#A0A4AB]">
            <span>Clientes Cadastrados</span>
            <Users className="w-4 h-4 text-[#E2B743]" />
          </div>
          <div className="mt-3 font-mono-tabular text-2xl font-bold text-white">
            {metrics.totalClients}
          </div>
          <div className="mt-1.5 text-xs text-[#A0A4AB]">
            Base ativa EDY-K
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg uppercase text-white">
                Receita: Serviços vs Loja
              </h2>
              <p className="text-xs text-[#A0A4AB]">Movimentação diária (R$)</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#A0A4AB]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E2B743]" />
                Serviços
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#5B606B]" />
                Produtos
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDay} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2E33" vertical={false} />
                <XAxis dataKey="label" stroke="#A0A4AB" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#A0A4AB" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D0E10',
                    border: '1px solid #2C2E33',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  formatter={(value) => formatBRL(Number(value ?? 0))}
                />
                <Bar dataKey="Servicos" name="Serviços" fill="#E2B743" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Produtos" name="Produtos" fill="#5B606B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-5 rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
          <h2 className="font-display text-lg uppercase text-white mb-1">Serviços em Alta</h2>
          <p className="text-xs text-[#A0A4AB] mb-5">Ranking por receita acumulada</p>
          <div className="space-y-4">
            {topServices.map((item) => {
              const max = topServices[0]?.total || 1;
              const pct = Math.round((item.total / max) * 100);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-white font-medium truncate">{item.name}</span>
                    <span className="font-mono-tabular text-[#E2B743] shrink-0">
                      {formatBRL(item.total)} ({item.count}x)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0D0E10] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-[#E2B743]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Operational Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg uppercase text-white">Agenda de Hoje</h2>
            <button
              type="button"
              onClick={onGoToAgenda}
              className="text-xs font-semibold text-[#E2B743] hover:text-[#F4D013] cursor-pointer"
            >
              Ver agenda completa →
            </button>
          </div>

          {metrics.todayApts.length === 0 ? (
            <p className="text-sm text-[#A0A4AB] py-6 text-center">
              Nenhum agendamento ativo para hoje.
            </p>
          ) : (
            <div className="divide-y divide-[#2C2E33]">
              {metrics.todayApts.map((apt) => (
                <div key={apt.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">
                      <span className="font-mono-tabular text-[#E2B743] mr-2">{apt.time}</span>
                      {apt.clientName}
                    </div>
                    <div className="text-xs text-[#A0A4AB] truncate">
                      {apt.serviceName} · {apt.barberName}
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs text-white shrink-0">
                    {formatBRL(apt.servicePrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-[#F4D013]" />
            <h2 className="font-display text-lg uppercase text-white">Estoque Crítico</h2>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-[#A0A4AB] py-6 text-center">
              Todos os produtos estão com estoque confortável.
            </p>
          ) : (
            <div className="divide-y divide-[#2C2E33]">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-white truncate">{p.name}</span>
                  <span className="font-mono-tabular text-xs font-semibold text-[#F4D013] shrink-0">
                    {p.stock} un.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
