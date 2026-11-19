import React from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Coins,
  Gift,
  History,
  ShoppingBag,
  Ticket,
  User as UserIcon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatDateBR } from '../utils/format';

interface MyRewardsViewProps {
  onGoBooking: () => void;
  onGoShop: () => void;
  onGoAuth: () => void;
}

const APPLIES_LABEL: Record<'service' | 'product' | 'both', string> = {
  service: 'Serviços',
  product: 'Produtos da Loja',
  both: 'Serviços ou Produtos',
};

export const MyRewardsView: React.FC<MyRewardsViewProps> = ({
  onGoBooking,
  onGoShop,
  onGoAuth,
}) => {
  const {
    currentUser,
    loyaltyConfig,
    rewards,
    redeemedRewards,
    pointTransactions,
    getUserPoints,
    redeemReward,
    notify,
  } = useStore();

  const pointsBalance = currentUser ? getUserPoints(currentUser.id) : 0;
  const activeRewards = rewards.filter((r) => r.active).sort((a, b) => a.pointsCost - b.pointsCost);
  const myVouchers = currentUser
    ? redeemedRewards.filter((r) => r.userId === currentUser.id)
    : [];
  const myHistory = currentUser
    ? pointTransactions.filter((t) => t.userId === currentUser.id)
    : [];

  const nextTarget = activeRewards.find((r) => r.pointsCost > pointsBalance) || activeRewards[activeRewards.length - 1];
  const progressPct = nextTarget
    ? Math.min(100, Math.round((pointsBalance / Math.max(1, nextTarget.pointsCost)) * 100))
    : 100;

  const handleRedeem = (rewardId: string) => {
    const res = redeemReward(rewardId);
    if (!res.ok && res.error) {
      notify(res.error, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">
            Programa de Fidelidade
          </p>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
            Meus Prêmios
          </h1>
          <p className="text-sm text-[#A0A4AB] mt-1">
            {currentUser
              ? `Saldo de pontos, cupons resgatados e recompensas exclusivas de ${currentUser.name}.`
              : 'Acumule pontos a cada corte agendado e produto comprado na EDY-K.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onGoBooking}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            Agendar &amp; Pontuar
          </button>
          <button
            type="button"
            onClick={onGoShop}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#2C2E33] bg-[#18191C] text-xs font-semibold text-white hover:border-[#E2B743] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 text-[#E2B743]" />
            Loja
          </button>
        </div>
      </div>

      {!currentUser ? (
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#222428] border border-[#2C2E33] flex items-center justify-center text-[#E2B743]">
            <UserIcon className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl uppercase text-white">
            Entre para acompanhar seus pontos
          </h2>
          <p className="text-sm text-[#A0A4AB] max-w-md mx-auto">
            Faça login ou crie sua conta gratuita para acumular pontos em cada atendimento e trocar por descontos reais.
          </p>
          <button
            type="button"
            onClick={onGoAuth}
            className="px-6 py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] text-sm font-bold uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
          >
            Entrar / Usar Cliente Demo
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Points Summary Banner */}
          <div className="rounded-2xl border border-[#E2B743]/40 bg-gradient-to-br from-[#1C1D22] via-[#18191C] to-[#111215] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#E2B743] font-semibold">
                <Award className="w-4 h-4" />
                <span>Saldo Atual de Pontos</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="font-mono-tabular text-4xl sm:text-5xl font-bold text-white">
                  {pointsBalance}
                </span>
                <span className="font-display text-lg uppercase text-[#E2B743]">pontos</span>
              </div>
              {!loyaltyConfig.enabled && (
                <p className="text-xs text-[#F4D013] mt-2">
                  Acúmulo de novos pontos pausado temporariamente pelo administrador.
                </p>
              )}
            </div>

            <div className="lg:col-span-7 space-y-3">
              {nextTarget && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#A0A4AB]">
                      {pointsBalance >= nextTarget.pointsCost
                        ? `Você já pode resgatar: ${nextTarget.title}`
                        : `Faltam ${nextTarget.pointsCost - pointsBalance} pts para ${nextTarget.title}`}
                    </span>
                    <span className="font-mono-tabular font-semibold text-[#E2B743]">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#0D0E10] border border-[#2C2E33] overflow-hidden">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className="h-full rounded-full bg-[#E2B743] transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#A0A4AB]">
                <div className="rounded-xl border border-[#2C2E33] bg-[#0D0E10]/70 px-3.5 py-2.5">
                  <span className="block text-white font-semibold">Serviços na Cadeira</span>
                  <span className="font-mono-tabular text-[#E2B743]">
                    {loyaltyConfig.pointsPerRealService} pts/R$ + {loyaltyConfig.bookingBonusPoints} bônus
                  </span>
                </div>
                <div className="rounded-xl border border-[#2C2E33] bg-[#0D0E10]/70 px-3.5 py-2.5">
                  <span className="block text-white font-semibold">Compras na Loja</span>
                  <span className="font-mono-tabular text-[#E2B743]">
                    {loyaltyConfig.pointsPerRealProduct} pts/R$ + {loyaltyConfig.productBonusPoints} bônus
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Rewards Catalog */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-[#E2B743]" />
              <h2 className="font-display text-2xl uppercase text-white">Recompensas para Resgate</h2>
            </div>

            {activeRewards.length === 0 ? (
              <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-8 text-center text-sm text-[#A0A4AB]">
                Nenhuma recompensa ativa no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRewards.map((reward) => {
                  const canRedeem = pointsBalance >= reward.pointsCost;
                  return (
                    <div
                      key={reward.id}
                      className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 flex flex-col justify-between gap-4 hover:border-[#E2B743]/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs text-[#A0A4AB]">
                              <span>Válido em: {APPLIES_LABEL[reward.appliesTo]}</span>
                              <span className="mx-1.5" aria-hidden="true">·</span>
                              <span className="text-emerald-400 font-semibold">
                                Desconto de {formatBRL(reward.discountAmount)}
                              </span>
                            </div>
                            <h3 className="font-display text-xl uppercase text-white mt-0.5">
                              {reward.title}
                            </h3>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono-tabular text-lg font-bold text-[#E2B743]">
                              {reward.pointsCost}
                            </span>
                            <span className="block text-[10px] uppercase text-[#A0A4AB]">pontos</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#A0A4AB] mt-2 leading-relaxed">
                          {reward.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!canRedeem}
                        onClick={() => handleRedeem(reward.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed ${
                          canRedeem
                            ? 'bg-[#E2B743] text-[#0D0E10] hover:bg-[#C89D2B]'
                            : 'bg-[#222428] border border-[#2C2E33] text-[#6B707A]'
                        }`}
                      >
                        {canRedeem
                          ? `Resgatar por ${reward.pointsCost} pts`
                          : `Faltam ${reward.pointsCost - pointsBalance} pts`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Redeemed Vouchers & History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* My Vouchers */}
            <section className="lg:col-span-6 rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="w-5 h-5 text-[#E2B743]" />
                <h2 className="font-display text-xl uppercase text-white">Meus Cupons Resgatados</h2>
              </div>

              {myVouchers.length === 0 ? (
                <p className="text-sm text-[#A0A4AB] py-8 text-center">
                  Você ainda não resgatou nenhuma recompensa. Troque seus pontos ao lado!
                </p>
              ) : (
                <div className="space-y-3">
                  {myVouchers.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-xl border border-[#2C2E33] bg-[#0D0E10] p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs text-[#A0A4AB]">
                            <span className="font-mono-tabular text-[#E2B743] font-bold">{v.code}</span>
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span>{APPLIES_LABEL[v.appliesTo]}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-white mt-0.5">{v.rewardTitle}</h3>
                        </div>
                        <span
                          className={`text-xs font-semibold shrink-0 ${
                            v.status === 'available' ? 'text-emerald-400' : 'text-[#A0A4AB]'
                          }`}
                        >
                          {v.status === 'available' ? 'Disponível' : 'Utilizado'}
                        </span>
                      </div>

                      {v.status === 'available' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#2C2E33]">
                          {(v.appliesTo === 'service' || v.appliesTo === 'both') && (
                            <button
                              type="button"
                              onClick={onGoBooking}
                              className="flex-1 py-2 rounded-lg bg-[#222428] border border-[#2C2E33] text-xs font-semibold text-white hover:border-[#E2B743] hover:text-[#E2B743] transition-colors cursor-pointer"
                            >
                              Usar em Agendamento
                            </button>
                          )}
                          {(v.appliesTo === 'product' || v.appliesTo === 'both') && (
                            <button
                              type="button"
                              onClick={onGoShop}
                              className="flex-1 py-2 rounded-lg bg-[#222428] border border-[#2C2E33] text-xs font-semibold text-white hover:border-[#E2B743] hover:text-[#E2B743] transition-colors cursor-pointer"
                            >
                              Usar na Loja
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Points Ledger */}
            <section className="lg:col-span-6 rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-[#E2B743]" />
                <h2 className="font-display text-xl uppercase text-white">Extrato de Pontos</h2>
              </div>

              {myHistory.length === 0 ? (
                <p className="text-sm text-[#A0A4AB] py-8 text-center">
                  Nenhuma movimentação de pontos registrada ainda.
                </p>
              ) : (
                <div className="divide-y divide-[#2C2E33]">
                  {myHistory.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <div className="text-white font-medium truncate">{tx.description}</div>
                        <div className="text-xs text-[#A0A4AB] flex items-center gap-1.5 mt-0.5">
                          {tx.points > 0 ? (
                            <Coins className="w-3 h-3 text-[#E2B743]" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-[#A0A4AB]" />
                          )}
                          <span>{formatDateBR(tx.createdAt)}</span>
                        </div>
                      </div>
                      <span
                        className={`font-mono-tabular font-bold shrink-0 ${
                          tx.points > 0 ? 'text-emerald-400' : 'text-[#F4D013]'
                        }`}
                      >
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
