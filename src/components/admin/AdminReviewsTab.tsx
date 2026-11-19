import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, MessageSquare, Search, Star, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatDateBR } from '../../utils/format';

export const AdminReviewsTab: React.FC = () => {
  const { reviews, moderateReview, deleteReview } = useStore();
  const [filter, setFilter] = useState<'all' | 'approved' | 'hidden'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (
        q &&
        !r.clientName.toLowerCase().includes(q) &&
        !r.barberName.toLowerCase().includes(q) &&
        !r.serviceName.toLowerCase().includes(q) &&
        !r.comment.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [reviews, filter, query]);

  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const hiddenCount = reviews.filter((r) => r.status === 'hidden').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl uppercase text-white">Moderação de Avaliações</h2>
          <p className="text-xs text-[#A0A4AB]">
            {approvedCount} publicada(s) · {hiddenCount} oculta(s). Ocultar ou remover recalcula a nota do barbeiro na vitrine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-[#A0A4AB] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Buscar comentário ou barbeiro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-[#2C2E33] bg-[#18191C] pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
            />
          </div>

          <div className="inline-flex p-1 rounded-xl border border-[#2C2E33] bg-[#18191C]">
            {[
              { id: 'all' as const, label: 'Todas' },
              { id: 'approved' as const, label: 'Publicadas' },
              { id: 'hidden' as const, label: 'Ocultas' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filter === tab.id ? 'bg-[#E2B743] text-[#0D0E10]' : 'text-[#A0A4AB] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] py-14 text-center px-4">
          <MessageSquare className="w-9 h-9 text-[#A0A4AB] mx-auto mb-3" />
          <p className="text-sm text-white font-medium">Nenhuma avaliação encontrada</p>
          <p className="text-xs text-[#A0A4AB] mt-1">Ajuste os filtros ou aguarde novas avaliações dos clientes.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className={`rounded-2xl border bg-[#18191C] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rev.status === 'hidden' ? 'border-red-500/30 opacity-80' : 'border-[#2C2E33]'
              }`}
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-white">{rev.clientName}</span>
                  <span className="text-[#555961]">·</span>
                  <span className="text-[#A0A4AB]">{formatDateBR(rev.createdAt)}</span>
                  <span className="text-[#555961]">·</span>
                  <span className={rev.status === 'approved' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {rev.status === 'approved' ? 'Publicada' : 'Oculta por moderação'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#A0A4AB]">
                  <span className="inline-flex items-center gap-1">
                    Serviço ({rev.serviceName}):
                    <strong className="text-[#F4D013] inline-flex items-center gap-0.5 ml-1 font-mono-tabular">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {rev.serviceRating}.0
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    Barbeiro ({rev.barberName}):
                    <strong className="text-[#E2B743] inline-flex items-center gap-0.5 ml-1 font-mono-tabular">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {rev.barberRating}.0
                    </strong>
                  </span>
                </div>

                <p className="text-sm text-white leading-relaxed">
                  {rev.comment ? `"${rev.comment}"` : <span className="text-[#A0A4AB] italic">Sem comentário escrito.</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => moderateReview(rev.id, rev.status === 'approved' ? 'hidden' : 'approved')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#2C2E33] bg-[#222428] text-xs font-semibold text-white hover:border-[#E2B743] transition-colors cursor-pointer"
                >
                  {rev.status === 'approved' ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#F4D013]" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      Aprovar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => deleteReview(rev.id)}
                  aria-label="Excluir avaliação"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
