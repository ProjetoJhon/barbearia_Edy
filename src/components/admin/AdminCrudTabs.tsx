import React, { useState } from 'react';
import { Edit3, Plus, Trash2, Upload, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ASSETS } from '../../data/seedData';
import { Barber, Product, ProductCategory, Service } from '../../types';
import { formatBRL } from '../../utils/format';

function readImageAsDataUrl(file: File, onLoad: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') onLoad(reader.result);
  };
  reader.readAsDataURL(file);
}

/* ==================== SERVICES CRUD ==================== */
export const AdminServicesTab: React.FC = () => {
  const { services, saveService, deleteService } = useStore();
  const [editing, setEditing] = useState<Partial<Service> | null>(null);

  const openNew = () =>
    setEditing({
      name: '',
      description: '',
      price: 55,
      durationMinutes: 40,
      category: 'Cabelo',
      active: true,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name?.trim()) return;
    saveService({
      id: editing.id,
      name: editing.name.trim(),
      description: editing.description?.trim() || '',
      price: Number(editing.price) || 0,
      durationMinutes: Number(editing.durationMinutes) || 30,
      category: (editing.category as Service['category']) || 'Cabelo',
      active: editing.active ?? true,
    });
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl uppercase text-white">Serviços Cadastrados</h2>
          <p className="text-xs text-[#A0A4AB]">Alterações refletem imediatamente na vitrine e agendamento.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-[#A0A4AB]">
                    <span>{srv.category}</span>
                    <span className="mx-1.5">·</span>
                    <span className="tabular-nums">{srv.durationMinutes} min</span>
                    <span className="mx-1.5">·</span>
                    <span className={srv.active ? 'text-emerald-400' : 'text-red-400'}>
                      {srv.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <h3 className="font-display text-lg uppercase text-white mt-0.5">{srv.name}</h3>
                </div>
                <span className="font-mono-tabular text-base font-bold text-[#E2B743]">
                  {formatBRL(srv.price)}
                </span>
              </div>
              <p className="text-xs text-[#A0A4AB] mt-2 leading-relaxed">{srv.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2C2E33]">
              <button
                type="button"
                onClick={() => saveService({ ...srv, active: !srv.active })}
                className="text-xs font-medium text-[#A0A4AB] hover:text-white cursor-pointer"
              >
                {srv.active ? 'Desativar' : 'Ativar na vitrine'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...srv })}
                  className="p-2 rounded-lg bg-[#222428] text-white hover:text-[#E2B743] cursor-pointer"
                  aria-label="Editar serviço"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteService(srv.id)}
                  className="p-2 rounded-lg bg-[#222428] text-red-400 hover:bg-red-500/20 cursor-pointer"
                  aria-label="Remover serviço"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl uppercase text-white">
                {editing.id ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button type="button" onClick={() => setEditing(null)} className="text-[#A0A4AB] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  value={editing.name || ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editing.price ?? 0}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Duração (min)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={editing.durationMinutes ?? 30}
                    onChange={(e) => setEditing({ ...editing, durationMinutes: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Categoria</label>
                  <select
                    value={editing.category || 'Cabelo'}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value as Service['category'] })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-2.5 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Combo">Combo</option>
                    <option value="Acabamento">Acabamento</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#A0A4AB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="accent-[#E2B743]"
                />
                Serviço ativo na vitrine
              </label>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer"
              >
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================== PRODUCTS CRUD ==================== */
export const AdminProductsTab: React.FC = () => {
  const { products, saveProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const openNew = () =>
    setEditing({
      name: '',
      description: '',
      category: 'Pomadas',
      price: 59.9,
      promoPrice: undefined,
      stock: 10,
      image: ASSETS.productPomade,
      active: true,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name?.trim()) return;
    saveProduct({
      id: editing.id,
      name: editing.name.trim(),
      description: editing.description?.trim() || '',
      category: (editing.category as ProductCategory) || 'Pomadas',
      price: Number(editing.price) || 0,
      promoPrice: editing.promoPrice && Number(editing.promoPrice) > 0 ? Number(editing.promoPrice) : undefined,
      stock: Math.max(0, Number(editing.stock) || 0),
      image: editing.image?.trim() || ASSETS.productPomade,
      active: editing.active ?? true,
    });
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl uppercase text-white">Produtos da Loja</h2>
          <p className="text-xs text-[#A0A4AB]">Gerencie catálogo, preços promocionais e estoque em tempo real.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="rounded-2xl border border-[#2C2E33] bg-[#18191C] overflow-hidden flex flex-col"
          >
            <div className="aspect-[16/9] bg-[#0D0E10] overflow-hidden">
              <img
                src={prod.image}
                alt={prod.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs text-[#A0A4AB]">
                  <span>{prod.category}</span>
                  <span className="mx-1.5">·</span>
                  <span className={prod.stock <= 3 ? 'text-[#F4D013] font-semibold' : ''}>
                    Estoque: {prod.stock}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mt-0.5">{prod.name}</h3>
                <div className="mt-1.5 flex items-baseline gap-2 font-mono-tabular">
                  <span className="text-base font-bold text-[#E2B743]">
                    {formatBRL(prod.promoPrice ?? prod.price)}
                  </span>
                  {prod.promoPrice && (
                    <span className="text-xs line-through text-[#A0A4AB]">{formatBRL(prod.price)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#2C2E33]">
                <button
                  type="button"
                  onClick={() => saveProduct({ ...prod, active: !prod.active })}
                  className="text-xs text-[#A0A4AB] hover:text-white cursor-pointer"
                >
                  {prod.active ? 'Ocultar' : 'Ativar'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...prod })}
                    className="p-2 rounded-lg bg-[#222428] text-white hover:text-[#E2B743] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(prod.id)}
                    className="p-2 rounded-lg bg-[#222428] text-red-400 hover:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl uppercase text-white">
                {editing.id ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button type="button" onClick={() => setEditing(null)} className="text-[#A0A4AB] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center gap-4">
                <img
                  src={editing.image || ASSETS.productPomade}
                  alt="Preview"
                  className="w-20 h-20 rounded-xl object-cover border border-[#2C2E33] bg-[#0D0E10] shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2C2E33] bg-[#222428] text-xs font-semibold text-white hover:border-[#E2B743] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#E2B743]" />
                    Enviar Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) readImageAsDataUrl(f, (url) => setEditing({ ...editing, image: url }));
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Ou cole a URL da imagem"
                    value={editing.image || ''}
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-1.5 text-xs text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={editing.name || ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editing.price ?? 0}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Promo (opc.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="—"
                    value={editing.promoPrice ?? ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        promoPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Estoque</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editing.stock ?? 0}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Categoria</label>
                  <select
                    value={editing.category || 'Pomadas'}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value as ProductCategory })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-2 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  >
                    <option value="Pomadas">Pomadas</option>
                    <option value="Óleos para Barba">Óleos para Barba</option>
                    <option value="Shampoos">Shampoos</option>
                    <option value="Kits">Kits</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer"
              >
                Salvar Produto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================== BARBERS (ELENCO) CRUD ==================== */
const WEEKDAY_OPTS = [
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
  { id: 0, label: 'Dom' },
];

export const AdminBarbersTab: React.FC = () => {
  const { barbers, saveBarber, deleteBarber } = useStore();
  const [editing, setEditing] = useState<Partial<Barber> | null>(null);

  const openNew = () =>
    setEditing({
      name: '',
      specialty: 'Corte Degradê & Barba',
      bio: '',
      photo: ASSETS.barberEdy,
      rating: 4.95,
      completedCuts: 150,
      workDays: [2, 3, 4, 5, 6],
      startHour: '09:00',
      endHour: '20:00',
      active: true,
    });

  const toggleDay = (dayId: number) => {
    if (!editing) return;
    const current = editing.workDays || [];
    const next = current.includes(dayId)
      ? current.filter((d) => d !== dayId)
      : [...current, dayId];
    setEditing({ ...editing, workDays: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name?.trim()) return;
    saveBarber({
      id: editing.id,
      name: editing.name.trim(),
      specialty: editing.specialty?.trim() || 'Barbeiro Profissional',
      bio: editing.bio?.trim() || '',
      photo: editing.photo?.trim() || ASSETS.barberEdy,
      rating: Number(editing.rating) || 4.9,
      completedCuts: Number(editing.completedCuts) || 0,
      workDays: editing.workDays?.length ? editing.workDays : [2, 3, 4, 5, 6],
      startHour: editing.startHour || '09:00',
      endHour: editing.endHour || '20:00',
      active: editing.active ?? true,
    });
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl uppercase text-white">Elenco de Barbeiros</h2>
          <p className="text-xs text-[#A0A4AB]">Edite perfis, especialidades, fotos e escalas de atendimento.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Novo Barbeiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className="rounded-2xl border border-[#2C2E33] bg-[#18191C] overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-[#0D0E10] overflow-hidden">
              <img
                src={barber.photo}
                alt={barber.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg uppercase text-white">{barber.name}</h3>
                  <span className="text-xs font-semibold text-[#F4D013] tabular-nums">
                    ★ {barber.rating.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-[#E2B743] mt-0.5">{barber.specialty}</p>
                <p className="text-xs text-[#A0A4AB] mt-2 font-mono-tabular">
                  Escala: {barber.startHour} – {barber.endHour}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#2C2E33]">
                <button
                  type="button"
                  onClick={() => saveBarber({ ...barber, active: !barber.active })}
                  className="text-xs text-[#A0A4AB] hover:text-white cursor-pointer"
                >
                  {barber.active ? 'Desativar' : 'Ativar'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...barber })}
                    className="p-2 rounded-lg bg-[#222428] text-white hover:text-[#E2B743] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBarber(barber.id)}
                    className="p-2 rounded-lg bg-[#222428] text-red-400 hover:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl uppercase text-white">
                {editing.id ? 'Editar Barbeiro' : 'Novo Barbeiro'}
              </h3>
              <button type="button" onClick={() => setEditing(null)} className="text-[#A0A4AB] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center gap-4">
                <img
                  src={editing.photo || ASSETS.barberEdy}
                  alt="Preview"
                  className="w-20 h-20 rounded-xl object-cover object-top border border-[#2C2E33] bg-[#0D0E10] shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2C2E33] bg-[#222428] text-xs font-semibold text-white hover:border-[#E2B743] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#E2B743]" />
                    Enviar Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) readImageAsDataUrl(f, (url) => setEditing({ ...editing, photo: url }));
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Ou cole a URL da foto"
                    value={editing.photo || ''}
                    onChange={(e) => setEditing({ ...editing, photo: e.target.value })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-1.5 text-xs text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Especialidade</label>
                  <input
                    type="text"
                    required
                    value={editing.specialty || ''}
                    onChange={(e) => setEditing({ ...editing, specialty: e.target.value })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1">Biografia curta</label>
                <textarea
                  rows={2}
                  value={editing.bio || ''}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A0A4AB] mb-1.5">Dias de Atendimento</label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTS.map((d) => {
                    const active = editing.workDays?.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDay(d.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                          active
                            ? 'bg-[#E2B743] text-[#0D0E10] border-[#E2B743]'
                            : 'bg-[#222428] text-[#A0A4AB] border-[#2C2E33]'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Início</label>
                  <input
                    type="time"
                    value={editing.startHour || '09:00'}
                    onChange={(e) => setEditing({ ...editing, startHour: e.target.value })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Término</label>
                  <input
                    type="time"
                    value={editing.endHour || '20:00'}
                    onChange={(e) => setEditing({ ...editing, endHour: e.target.value })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A4AB] mb-1">Nota (0–5)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={editing.rating ?? 4.95}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] cursor-pointer"
              >
                Salvar Profissional
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
