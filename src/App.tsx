import React, { useEffect, useState } from 'react';
import {
  Award,
  Calendar,
  Home,
  Instagram,
  LogOut,
  Shield,
  ShoppingBag,
  User as UserIcon,
  X,
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Appointment, ClientView } from './types';
import { AuthView } from './components/AuthView';
import { BookingFlow } from './components/BookingFlow';
import { CartDrawer } from './components/CartDrawer';
import { EdykLogo } from './components/EdykLogo';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { HomeView } from './components/HomeView';
import { MyAppointments } from './components/MyAppointments';
import { MyRewardsView } from './components/MyRewardsView';
import { OfflineIndicator, PWAInstallButton } from './components/PWAControls';
import { ShopView } from './components/ShopView';
import { AdminPanel } from './components/admin/AdminPanel';

const AppShell: React.FC = () => {
  const { currentUser, settings, cartCount, toasts, logout } = useStore();

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    window.location.pathname.startsWith('/admin')
  );
  const [view, setView] = useState<ClientView>('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [bookingPreset, setBookingPreset] = useState<{
    serviceId?: string;
    barberId?: string;
    reschedule?: Appointment | null;
  }>({});

  useEffect(() => {
    const onPopState = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateAdmin = (enter: boolean) => {
    const targetPath = enter ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setIsAdminRoute(enter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goClientView = (next: ClientView) => {
    if (isAdminRoute) {
      navigateAdmin(false);
    }
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartBooking = (opts?: { serviceId?: string; barberId?: string }) => {
    setBookingPreset({ serviceId: opts?.serviceId, barberId: opts?.barberId, reschedule: null });
    goClientView('booking');
  };

  const handleReschedule = (apt: Appointment) => {
    setBookingPreset({ serviceId: apt.serviceId, barberId: apt.barberId, reschedule: apt });
    goClientView('booking');
  };

  // Dedicated Admin Workspace when on /admin and authenticated as admin
  if (isAdminRoute && currentUser?.role === 'admin') {
    return (
      <>
        <AdminPanel onExitAdmin={() => navigateAdmin(false)} />
        <ToastStack toasts={toasts} />
        <OfflineIndicator />
      </>
    );
  }

  // If on /admin without admin privileges, show admin login screen cleanly
  const showingAdminGate = isAdminRoute && currentUser?.role !== 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0E10] text-white">
      {/* Slim CMS Top Notice Bar */}
      {settings.topNoticeEnabled && settings.topNoticeText && !noticeDismissed && (
        <div className="bg-[#18191C] border-b border-[#2C2E33] px-4 py-1.5 text-center relative">
          <p className="text-xs text-[#E2B743] pr-7 truncate max-w-5xl mx-auto">
            {settings.topNoticeText}
          </p>
          <button
            type="button"
            onClick={() => setNoticeDismissed(true)}
            aria-label="Fechar aviso"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#A0A4AB] hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#2C2E33] bg-[#0D0E10]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Emblem + Wordmark */}
          <button
            type="button"
            onClick={() => goClientView('home')}
            className="flex items-center gap-3 whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            <EdykLogo size={42} customLogoUrl={settings.customLogoUrl} />
            <span className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              EDY-K
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A0A4AB]">
            <button
              type="button"
              onClick={() => goClientView('home')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !showingAdminGate && view === 'home' ? 'text-[#E2B743]' : ''
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => handleStartBooking()}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !showingAdminGate && view === 'booking' ? 'text-[#E2B743]' : ''
              }`}
            >
              Agendar
            </button>
            <button
              type="button"
              onClick={() => goClientView('shop')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !showingAdminGate && view === 'shop' ? 'text-[#E2B743]' : ''
              }`}
            >
              Loja
            </button>
            <button
              type="button"
              onClick={() => goClientView('appointments')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !showingAdminGate && view === 'appointments' ? 'text-[#E2B743]' : ''
              }`}
            >
              Meus Horários
            </button>
            <button
              type="button"
              onClick={() => goClientView('rewards')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !showingAdminGate && view === 'rewards' ? 'text-[#E2B743]' : ''
              }`}
            >
              Meus Prêmios
            </button>
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => navigateAdmin(true)}
                className="text-[#F4D013] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Painel Admin
              </button>
            )}
          </nav>

          {/* Zone 3: Cart & Primary Account Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrinho com ${cartCount} itens`}
              className="relative min-h-[40px] min-w-[40px] px-2.5 rounded-lg border border-[#2C2E33] bg-[#18191C] text-white hover:border-[#E2B743] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-[#E2B743]" />
              {cartCount > 0 && (
                <span className="font-mono-tabular text-xs font-bold text-[#E2B743]">
                  {cartCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5">
                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => navigateAdmin(true)}
                    className="md:hidden min-h-[40px] px-3 rounded-lg bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase cursor-pointer whitespace-nowrap"
                  >
                    Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={logout}
                  title="Sair da conta"
                  className="inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-lg border border-[#2C2E33] bg-[#18191C] text-xs font-semibold text-white hover:border-red-400/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="max-w-[96px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <LogOut className="w-3.5 h-3.5 text-[#A0A4AB]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => goClientView('auth')}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-lg bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {showingAdminGate ? (
          <AuthView
            adminHint
            onSuccess={(role) => {
              if (role === 'admin') {
                navigateAdmin(true);
              } else {
                goClientView('home');
              }
            }}
          />
        ) : view === 'home' ? (
          <HomeView
            onStartBooking={handleStartBooking}
            onOpenShop={() => goClientView('shop')}
            onOpenCart={() => setCartOpen(true)}
          />
        ) : view === 'booking' ? (
          <BookingFlow
            initialServiceId={bookingPreset.serviceId}
            initialBarberId={bookingPreset.barberId}
            rescheduleAppointment={bookingPreset.reschedule}
            onComplete={() => {
              setBookingPreset({});
              goClientView('appointments');
            }}
            onRequireAuth={() => goClientView('auth')}
          />
        ) : view === 'shop' ? (
          <ShopView onOpenCart={() => setCartOpen(true)} />
        ) : view === 'appointments' ? (
          <MyAppointments
            onNewBooking={() => handleStartBooking()}
            onReschedule={handleReschedule}
            onOpenShop={() => goClientView('shop')}
            onOpenRewards={() => goClientView('rewards')}
          />
        ) : view === 'rewards' ? (
          <MyRewardsView
            onGoBooking={() => handleStartBooking()}
            onGoShop={() => goClientView('shop')}
            onGoAuth={() => goClientView('auth')}
          />
        ) : (
          <AuthView
            onSuccess={(role) => {
              if (role === 'admin') {
                navigateAdmin(true);
              } else {
                goClientView('home');
              }
            }}
          />
        )}
      </main>

      {/* Clean Luxury Footer */}
      <footer className="border-t border-[#2C2E33] bg-[#141518] pb-24 md:pb-10 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <EdykLogo size={46} customLogoUrl={settings.customLogoUrl} />
            <div>
              <div className="font-display text-lg uppercase text-white tracking-wider">
                {settings.shopName}
              </div>
              <div className="text-xs text-[#A0A4AB]">
                {settings.address} · {settings.neighborhood}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PWAInstallButton compact />
            <a
              href={`https://instagram.com/${settings.instagramHandle.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2C2E33] bg-[#18191C] text-xs text-[#A0A4AB] hover:text-[#E2B743] transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              {settings.instagramHandle}
            </a>
            <button
              type="button"
              onClick={() => navigateAdmin(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2C2E33] bg-[#18191C] text-xs text-[#A0A4AB] hover:text-[#E2B743] transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              Painel Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (< md) */}
      <nav
        aria-label="Navegação mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#2C2E33] bg-[#0D0E10]/95 backdrop-blur-md pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {[
            { id: 'home' as const, label: 'Início', icon: Home, onClick: () => goClientView('home') },
            { id: 'booking' as const, label: 'Agendar', icon: Calendar, onClick: () => handleStartBooking() },
            { id: 'shop' as const, label: 'Loja', icon: ShoppingBag, onClick: () => goClientView('shop') },
            { id: 'appointments' as const, label: 'Horários', icon: UserIcon, onClick: () => goClientView('appointments') },
            {
              id: 'rewards' as const,
              label: 'Prêmios',
              icon: Award,
              onClick: () => goClientView('rewards'),
            },
          ].map((item) => {
            const Icon = item.icon;
            const active = !showingAdminGate && view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center h-full gap-1 transition-colors cursor-pointer ${
                  active ? 'text-[#E2B743]' : 'text-[#A0A4AB]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Slide-over Shopping Cart */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrderComplete={() => goClientView('appointments')}
      />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp />

      {/* Offline Banner & Toast Notifications */}
      <OfflineIndicator />
      <ToastStack toasts={toasts} />
    </div>
  );
};

const ToastStack: React.FC<{ toasts: Array<{ id: string; text: string; type: 'success' | 'error' | 'info' }> }> = ({
  toasts,
}) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-20 right-4 z-[80] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-xs font-medium shadow-xl backdrop-blur-md ${
            t.type === 'error'
              ? 'border-red-500/40 bg-[#18191C]/95 text-red-300'
              : t.type === 'info'
                ? 'border-[#2C2E33] bg-[#18191C]/95 text-white'
                : 'border-[#E2B743]/50 bg-[#18191C]/95 text-[#E2B743]'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

export default App;
