import React, { useState } from 'react';
import { Award, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { LoyaltyConfig, RewardOption } from '../../types';
import { formatBRL } from '../../utils/format';

const APPLIES_LABEL: Record<'service' | 'product' | 'both', string> = {
  service: 'Serviços',
  product: 'Produtos',
  both: 'Serviços & Produtos',
};

export const AdminLoyaltyTab: React.FC = () => {
  const {
    loyaltyConfig,
    rewards,
    pointTransactions,
    redeemedRewards,
    updateLoyaltyConfig,
    saveReward,
    deleteReward,
  } = useStore();

  const [configForm, setConfigForm] = useState<LoyaltyConfig>(loyaltyConfig);
  const [editingReward, setEditingReward] = useState<Partial<RewardOption> | null>(null);

  const totalPointsIssued = pointTransactions
    .filter((t) => t.points > 0)
    .reduce((s, t) => s + t.points, 0);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateLoyaltyConfig({
      enabled: configForm.enabled,
      pointsPerRealService: Math.max(0, Number(configForm.pointsPerRealService) || 0),
      bookingBonusPoints: Math.max(0, Number(configForm.bookingBonusPoints) || 0),
      pointsPerRealProduct: Math.max(0, Number(configForm.pointsPerRealProduct) || 0),
      productBonusPoints: Math.max(0, Number(configForm.productBonusPoints) || 0),
    });
  };

  const openNewReward = () =>
    setEditingReward({
      title: '',
      description: '',
      pointsCost: 150,
      discountAmount: 15,
      appliesTo: 'service',
      active: true,
    });

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward || !editingReward.title?.trim()) return;
    saveReward({
      id: editingReward.id,
      title: editingReward.title.trim(),
      description: editingReward.description?.trim() || '',
      pointsCost: Math.max(10, Number(editingReward.pointsCost) || 100),
      discountAmount: Math.max(1, Number(editingReward.discountAmount) || 10),
      appliesTo: editingReward.appliesTo || 'both',
      active: editingReward.active ?? true,
    });
    setEditingReward(null);
  };

  return (
    <div className="space-y-6">
      {/* Program Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
          <div className="text-xs text-[#A0A4AB]">Status do Programa</div>
          <div className={`mt-2 font-display text-2xl uppercase ${loyaltyConfig.enabled ? 'text-emerald-400' : 'text-red-400'}`}>
            {loyaltyConfig.enabled ? 'Ativo' : 'Pausado'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
          <div className="text-xs text-[#A0A4AB]">Pontos Emitidos</div>
          <div className="mt-2 font-mono-tabular text-2xl font-bold text-[#E2B743]">
            {totalPointsIssued} pts
          </div>
        </div>
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5">
          <div className="text-xs text-[#A0A4AB]">Cupons Resgatados</div>
          <div className="mt-2 font-mono-tabular text-2xl font-bold text-white">
            {redeemedRewards.length}
          </div>
        </div>
      </div>

      {/* Point Earning Rates Form */}
      <form onSubmit={handleSaveConfig} className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl uppercase text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E2B743]" />
              Regras de Pontuação
            </h2>
            <p className="text-xs text-[#A0A4AB]">
              Defina quantos pontos o cliente ganha por serviço agendado e produto comprado.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
            <input
              type="checkbox"
              checked={configForm.enabled}
              onChange={(e) => setConfigForm({ ...configForm, enabled: e.target.checked })}
              className="accent-[#E2B743] w-4 h-4"
            />
            Programa de Fidelidade Ativo
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Pontos por R$ 1 (Serviços)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={configForm.pointsPerRealService}
              onChange={(e) => setConfigForm({ ...configForm, pointsPerRealService: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Bônus Fixo por Agendamento</label>
            <input
              type="number"
              min="0"
              value={configForm.bookingBonusPoints}
              onChange={(e) => setConfigForm({ ...configForm, bookingBonusPoints: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Pontos por R$ 1 (Produtos)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={configForm.pointsPerRealProduct}
              onChange={(e) => setConfigForm({ ...configForm, pointsPerRealProduct: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Bônus Fixo por Pedido Loja</label>
            <input
              type="number"
              min="0"
              value={configForm.productBonusPoints}
              onChange={(e) => setConfigForm({ ...configForm, productBonusPoints: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Taxas de Pontuação
          </button>
        </div>
      </form>

      {/* Reward Options CRUD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl uppercase text-white">Opções de Recompensa</h2>
            <p className="text-xs text-[#A0A4AB]">Cupons que os clientes podem resgatar com seus pontos.</p>
          </div>
          <button
            type="button"
            onClick={openNewReward}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nova Recompensa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((rew) => (
            <div
              key={rew.id}
              className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#A0A4AB]">
                      <span>{APPLIES_LABEL[rew.appliesTo]}</span>
                      <span className="mx-1.5">·</span>
                      <span className="text-emerald-400 font-semibold">{formatBRL(rew.discountAmount)} OFF</span>
                      <span className="mx-1.5">·</span>
                      <span className={rew.active ? 'text-emerald-400' : 'text-red-400'}>
                        {rew.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <h3 className="font-display text-lg uppercase text-white mt-0.5">{rew.title}</h3>
                  </div>
                  <span className="font-mono-tabular text-base font-bold text-[#E2B743] shrink-0">
                    {rew.pointsCost} pts
                  </span>
                </div>
                <p className="text-xs text-[#A0A4AB] mt-2 leading-relaxed">{rew.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2C2E33]">
                <button
                  type="button"
                  onClick={() => saveReward({ ...rew, active: !rew.active })}
                  className="text-xs text-[#A0A4AB] hover:text-white cursor-pointer"
                >
                  {rew.active ? 'Desativar' : 'Ativar'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingReward({ ...rew })}
                    className="p-2 rounded-lg bg-[#222428] text-white hover:text-[#E2B743] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReward(rew.id)}
                    className="p-2 rounded-lg bg-[#222428] text-red-400 hover:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl uppercase text-white">
                {editingReward.id ? 'Editar Recompensa' : 'Nova Recompensa'}
              </h3>
              <button type="button" onClick={() => setEditingReward(null)} className="text-[#A0A4AB] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveReward} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Título do Benefício</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: R$ 25 OFF no Corte"
                  value={editingReward.title || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editingReward.description || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Custo (pts)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={editingReward.pointsCost ?? 100}
                    onChange={(e) => setEditingReward({ ...editingReward, pointsCost: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Desconto (R$)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={editingReward.discountAmount ?? 15}
                    onChange={(e) => setEditingReward({ ...editingReward, discountAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Aplicável em</label>
                  <select
                    value={editingReward.appliesTo || 'both'}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, appliesTo: e.target.value as RewardOption['appliesTo'] })
                    }
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-2 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  >
                    <option value="service">Serviços</option>
                    <option value="product">Produtos</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#A0A4AB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingReward.active ?? true}
                  onChange={(e) => setEditingReward({ ...editingReward, active: e.target.checked })}
                  className="accent-[#E2B743]"
                />
                Recompensa ativa para resgate
              </label>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer"
              >
                Salvar Recompensa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
