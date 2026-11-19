import React, { useState } from 'react';
import { RotateCcw, Save, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DaySchedule, ShopSettings } from '../../types';
import { EdykLogo } from '../EdykLogo';

export const AdminSettingsTab: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useStore();
  const [form, setForm] = useState<ShopSettings>(settings);

  const handleScheduleChange = (dayIndex: number, patch: Partial<DaySchedule>) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((d) => (d.dayIndex === dayIndex ? { ...d, ...patch } : d)),
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, customLogoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Brand & Logo CMS */}
      <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl uppercase text-white">Identidade &amp; Logomarca</h2>
          <p className="text-xs text-[#A0A4AB]">
            Mantenha o emblema SVG vetorial EDY-K ou envie uma imagem própria.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <EdykLogo size={84} customLogoUrl={form.customLogoUrl} />
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2C2E33] bg-[#222428] text-xs font-semibold text-white hover:border-[#E2B743] cursor-pointer">
                <Upload className="w-4 h-4 text-[#E2B743]" />
                Carregar Imagem da Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              {form.customLogoUrl && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, customLogoUrl: '' }))}
                  className="px-3.5 py-2 rounded-lg border border-[#2C2E33] text-xs text-[#A0A4AB] hover:text-white cursor-pointer"
                >
                  Restaurar Emblema SVG Padrão
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Ou cole a URL da imagem da logomarca..."
              value={form.customLogoUrl}
              onChange={(e) => setForm({ ...form, customLogoUrl: e.target.value })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2 text-xs text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contact, Social & Top Notice */}
      <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 space-y-4">
        <h2 className="font-display text-xl uppercase text-white">Contato, Endereço &amp; Aviso</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Nome da Barbearia</label>
            <input
              type="text"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Telefone / WhatsApp</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Link Direto do WhatsApp</label>
            <input
              type="url"
              value={form.whatsappUrl}
              onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Instagram</label>
            <input
              type="text"
              value={form.instagramHandle}
              onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Endereço</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A0A4AB] mb-1">Bairro / Cidade</label>
            <input
              type="text"
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#2C2E33] space-y-2.5">
          <label className="flex items-center gap-2 text-xs font-medium text-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.topNoticeEnabled}
              onChange={(e) => setForm({ ...form, topNoticeEnabled: e.target.checked })}
              className="accent-[#E2B743]"
            />
            Exibir faixa de aviso no topo da vitrine
          </label>
          <input
            type="text"
            placeholder="Aviso exibido no topo do site..."
            value={form.topNoticeText}
            onChange={(e) => setForm({ ...form, topNoticeText: e.target.value })}
            className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] px-3.5 py-2.5 text-sm text-white focus:border-[#E2B743] focus:outline-none"
          />
        </div>
      </div>

      {/* Weekly Schedule Editor */}
      <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl uppercase text-white">Horários de Funcionamento</h2>
          <p className="text-xs text-[#A0A4AB]">
            Refletido na seção "Horário e Atendimento" e no bloqueio de dias do agendamento.
          </p>
        </div>

        <div className="divide-y divide-[#2C2E33]">
          {form.schedule.map((day) => (
            <div
              key={day.dayIndex}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-[160px]">
                <input
                  type="checkbox"
                  checked={!day.closed}
                  onChange={(e) => handleScheduleChange(day.dayIndex, { closed: !e.target.checked })}
                  className="accent-[#E2B743] w-4 h-4"
                />
                <span className={`text-sm font-medium ${day.closed ? 'text-[#A0A4AB] line-through' : 'text-white'}`}>
                  {day.dayLabel}
                </span>
              </div>

              {day.closed ? (
                <span className="text-xs text-[#A0A4AB] uppercase tracking-wider">Fechado</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => handleScheduleChange(day.dayIndex, { open: e.target.value })}
                    className="rounded-lg border border-[#2C2E33] bg-[#222428] px-2.5 py-1.5 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                  <span className="text-xs text-[#A0A4AB]">às</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => handleScheduleChange(day.dayIndex, { close: e.target.value })}
                    className="rounded-lg border border-[#2C2E33] bg-[#222428] px-2.5 py-1.5 text-sm font-mono-tabular text-white focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            resetDemoData();
            window.location.reload();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#2C2E33] bg-[#18191C] text-xs font-semibold text-[#A0A4AB] hover:text-white cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Restaurar Dados de Demonstração
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Salvar Configurações CMS
        </button>
      </div>
    </form>
  );
};
