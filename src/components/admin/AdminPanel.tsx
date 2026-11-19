import React, { useState } from 'react';
import {
  Award,
  Calendar,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Scissors,
  Settings,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminTab } from '../../types';
import { EdykLogo } from '../EdykLogo';
import { AdminAgendaTab } from './AdminAgendaTab';
import { AdminBarbersTab, AdminProductsTab, AdminServicesTab } from './AdminCrudTabs';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminLoyaltyTab } from './AdminLoyaltyTab';
import { AdminReviewsTab } from './AdminReviewsTab';
import { AdminSettingsTab } from './AdminSettingsTab';

interface AdminPanelProps {
  onExitAdmin: () => void;
}

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'services', label: 'Serviços', icon: Scissors },
  { id: 'products', label: 'Produtos', icon: ShoppingBag },
  { id: 'barbers', label: 'Elenco', icon: Users },
  { id: 'reviews', label: 'Avaliações', icon: MessageSquare },
  { id: 'loyalty', label: 'Fidelidade', icon: Award },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin }) => {
  const { settings, currentUser, logout } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const activeMeta = NAV_ITEMS.find((n) => n.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#0D0E10] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-[#2C2E33] bg-[#141518]">
        <div className="flex items-center gap-3 px-5 h-20 border-b border-[#2C2E33]">
          <EdykLogo size={42} customLogoUrl={settings.customLogoUrl} />
          <div className="min-w-0">
            <div className="font-display text-base uppercase text-white tracking-wider truncate">
              EDY-K Admin
            </div>
            <div className="text-[11px] text-[#E2B743] truncate">Controle Total</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#E2B743] text-[#0D0E10] font-semibold'
                    : 'text-[#A0A4AB] hover:text-white hover:bg-[#18191C]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2C2E33] space-y-2">
          <button
            type="button"
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#2C2E33] bg-[#18191C] text-xs font-semibold text-white hover:border-[#E2B743] hover:text-[#E2B743] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Vitrine do Cliente
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              onExitAdmin();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs text-[#A0A4AB] hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair ({currentUser?.name.split(' ')[0]})
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Admin Header */}
        <header className="sticky top-0 z-30 border-b border-[#2C2E33] bg-[#0D0E10]/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <div className="lg:hidden">
                <EdykLogo size={34} customLogoUrl={settings.customLogoUrl} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-[#A0A4AB] hidden sm:block">
                  Painel Administrativo / {activeMeta.label}
                </div>
                <h1 className="font-display text-lg sm:text-xl uppercase text-white truncate">
                  {activeMeta.label}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onExitAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#2C2E33] bg-[#18191C] text-xs font-semibold text-white hover:border-[#E2B743] hover:text-[#E2B743] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abrir Vitrine</span>
                <span className="sm:hidden">Vitrine</span>
              </button>
            </div>
          </div>

          {/* Mobile Horizontal Tab Scroller */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-4 pb-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#E2B743] text-[#0D0E10]'
                      : 'bg-[#18191C] border border-[#2C2E33] text-[#A0A4AB]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab onGoToAgenda={() => setActiveTab('agenda')} />
          )}
          {activeTab === 'agenda' && <AdminAgendaTab />}
          {activeTab === 'services' && <AdminServicesTab />}
          {activeTab === 'products' && <AdminProductsTab />}
          {activeTab === 'barbers' && <AdminBarbersTab />}
          {activeTab === 'reviews' && <AdminReviewsTab />}
          {activeTab === 'loyalty' && <AdminLoyaltyTab />}
          {activeTab === 'settings' && <AdminSettingsTab />}
        </main>
      </div>
    </div>
  );
};
