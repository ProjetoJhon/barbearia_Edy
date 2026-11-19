import React from 'react';
import {
  ArrowRight,
  Calendar,
  Clock,
  Instagram,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ASSETS } from '../data/seedData';
import { formatBRL, formatDateBR } from '../utils/format';

interface HomeViewProps {
  onStartBooking: (opts?: { serviceId?: string; barberId?: string }) => void;
  onOpenShop: () => void;
  onOpenCart: () => void;
}

const DAY_SHORT_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const HomeView: React.FC<HomeViewProps> = ({
  onStartBooking,
  onOpenShop,
  onOpenCart,
}) => {
  const { services, barbers, products, settings, reviews, getBarberRatingStats, addToCart } = useStore();

  const activeServices = services.filter((s) => s.active);
  const activeBarbers = barbers.filter((b) => b.active);
  const featuredProducts = products.filter((p) => p.active).slice(0, 4);
  const recentReviews = reviews.filter((r) => r.status === 'approved').slice(0, 6);
  const overallAvgRating =
    recentReviews.length > 0
      ? (
          reviews
            .filter((r) => r.status === 'approved')
            .reduce((s, r) => s + (r.barberRating + r.serviceRating) / 2, 0) /
          reviews.filter((r) => r.status === 'approved').length
        ).toFixed(2)
      : '4.97';
  const todayIndex = new Date().getDay();
  const todaySchedule = settings.schedule.find((d) => d.dayIndex === todayIndex);

  return (
    <div className="pb-16">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden border-b border-[#2C2E33]">
        <div className="absolute inset-0">
          <img
            src={ASSETS.hero}
            alt="Interior da EDY-K Barbershop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0E10] via-[#0D0E10]/85 to-[#0D0E10]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E10] via-transparent to-[#0D0E10]/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#E2B743] mb-3">
              {settings.shopName} · {settings.neighborhood}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-white leading-[1.05] text-balance">
              Corte de precisão, barba na navalha e estilo atemporal.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#A0A4AB] max-w-xl leading-relaxed">
              Reserve seu horário em menos de 1 minuto com nosso elenco de barbeiros. Pague via Pix, cartão ou diretamente na cadeira.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => onStartBooking()}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#E2B743] text-[#0D0E10] font-display font-bold text-base uppercase tracking-wider hover:bg-[#C89D2B] active:scale-[0.99] transition-all shadow-lg shadow-[#E2B743]/15 cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-5 h-5 shrink-0" />
                Agende Seu Horário
              </button>
              <button
                type="button"
                onClick={onOpenShop}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-[#2C2E33] bg-[#18191C]/85 text-white font-semibold text-sm hover:border-[#E2B743] hover:text-[#E2B743] transition-colors backdrop-blur-sm cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                Explorar Loja EDY-K
              </button>
            </div>
          </div>

          {/* Full-width proof strip below hero copy */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-[#E2B743] tabular-nums">
                {overallAvgRating} ★
              </div>
              <div className="text-xs text-[#A0A4AB] mt-1">Avaliação média dos clientes</div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">+3.400</div>
              <div className="text-xs text-[#A0A4AB] mt-1">Atendimentos realizados</div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {todaySchedule?.closed ? 'Fechado' : `${todaySchedule?.open} – ${todaySchedule?.close}`}
              </div>
              <div className="text-xs text-[#A0A4AB] mt-1">
                Funcionamento hoje ({todaySchedule?.shortLabel})
              </div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">Pix &amp; Cartão</div>
              <div className="text-xs text-[#A0A4AB] mt-1">Pagamento online ou na barbearia</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS PREVIEW */}
      <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">Menu de Serviços</p>
            <h2 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
              Rituais &amp; Valores
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onStartBooking()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#E2B743] hover:text-[#F4D013] transition-colors self-start sm:self-auto cursor-pointer whitespace-nowrap"
          >
            Ver agenda disponível
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {activeServices.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 hover:border-[#E2B743]/60 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#A0A4AB] mb-1">
                      <span>{service.category}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="tabular-nums">{service.durationMinutes} min</span>
                    </div>
                    <h3 className="font-display text-xl uppercase text-white group-hover:text-[#E2B743] transition-colors">
                      {service.name}
                    </h3>
                  </div>
                  <div className="font-mono-tabular text-lg font-bold text-[#E2B743] shrink-0">
                    {formatBRL(service.price)}
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#A0A4AB] leading-relaxed">
                  {service.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onStartBooking({ serviceId: service.id })}
                className="mt-6 w-full py-2.5 px-4 rounded-xl border border-[#2C2E33] bg-[#222428] text-sm font-semibold text-white hover:bg-[#E2B743] hover:text-[#0D0E10] hover:border-[#E2B743] transition-colors cursor-pointer"
              >
                Agendar este serviço
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ELENCO (BARBEIROS) */}
      <section id="elenco" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">Profissionais</p>
            <h2 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
              Elenco EDY-K
            </h2>
          </div>
          <p className="text-sm text-[#A0A4AB] max-w-md">
            Escolha seu barbeiro de confiança ou deixe sem preferência para visualizar todos os horários livres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeBarbers.map((barber) => {
            const stats = getBarberRatingStats(barber.id, barber.rating);
            return (
              <article
                key={barber.id}
                className="group rounded-2xl border border-[#2C2E33] bg-[#18191C] overflow-hidden flex flex-col hover:border-[#E2B743]/60 transition-colors"
              >
                <div className="relative aspect-[3/4] bg-[#0D0E10] overflow-hidden">
                  <img
                    src={barber.photo}
                    alt={`Barbeiro ${barber.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18191C] via-[#18191C]/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <div className="flex items-center gap-1.5 text-xs text-[#F4D013] font-medium mb-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="tabular-nums font-semibold">{stats.average.toFixed(2)}</span>
                      <span className="text-[#A0A4AB]" aria-hidden="true">·</span>
                      <span className="text-[#A0A4AB] tabular-nums">
                        {stats.count > 0 ? `${stats.count} avaliações` : `${barber.completedCuts} cortes`}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl uppercase text-white">{barber.name}</h3>
                    <p className="text-xs text-[#E2B743] mt-0.5">{barber.specialty}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-[#A0A4AB] leading-relaxed">{barber.bio}</p>
                    <div className="mt-4 pt-3 border-t border-[#2C2E33] text-xs text-[#A0A4AB] flex items-center justify-between gap-2">
                      <span>
                        {barber.workDays.map((d) => DAY_SHORT_NAMES[d]).join(', ')}
                      </span>
                      <span className="font-mono-tabular text-white shrink-0">
                        {barber.startHour}–{barber.endHour}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartBooking({ barberId: barber.id })}
                    className="mt-5 w-full py-3 rounded-xl bg-[#222428] border border-[#2C2E33] text-sm font-semibold text-white hover:bg-[#E2B743] hover:text-[#0D0E10] hover:border-[#E2B743] transition-colors cursor-pointer"
                  >
                    Agendar com {barber.name.split(' ')[0]}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* AVALIAÇÕES RECENTES */}
      {recentReviews.length > 0 && (
        <section id="avaliacoes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">
                Experiência Real
              </p>
              <h2 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
                Avaliações Recentes
              </h2>
            </div>
            <p className="text-sm text-[#A0A4AB]">
              Nota média <strong className="text-[#E2B743] tabular-nums">{overallAvgRating} ★</strong> verificada após atendimentos concluídos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentReviews.map((rev) => (
              <article
                key={rev.id}
                className="rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-[#F4D013]">
                      {Array.from({ length: 5 }, (_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < Math.round((rev.barberRating + rev.serviceRating) / 2)
                              ? 'fill-current'
                              : 'text-[#2C2E33]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#A0A4AB]">{formatDateBR(rev.createdAt)}</span>
                  </div>

                  <p className="text-sm text-white leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2C2E33] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{rev.clientName}</span>
                    <span className="text-[#E2B743] font-mono-tabular">
                      Serviço {rev.serviceRating}★ · Barbeiro {rev.barberRating}★
                    </span>
                  </div>
                  <div className="text-[#A0A4AB] truncate">
                    {rev.serviceName} · com {rev.barberName}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* LOJA DE PRODUTOS PREVIEW */}
      <section id="loja-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">Grooming Oficial</p>
            <h2 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
              Loja de Produtos
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenShop}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#E2B743] hover:text-[#F4D013] transition-colors self-start sm:self-auto cursor-pointer whitespace-nowrap"
          >
            Ver catálogo completo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProducts.map((product) => {
            const finalPrice = product.promoPrice ?? product.price;
            const outOfStock = product.stock <= 0;
            return (
              <div
                key={product.id}
                className="group rounded-2xl border border-[#2C2E33] bg-[#18191C] overflow-hidden flex flex-col hover:border-[#E2B743]/60 transition-colors"
              >
                <div className="aspect-[4/3] bg-[#0D0E10] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-[#A0A4AB] mb-1">
                      <span>{product.category}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className={outOfStock ? 'text-red-400' : 'text-[#A0A4AB]'}>
                        {outOfStock ? 'Esgotado' : `${product.stock} em estoque`}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2C2E33] flex items-center justify-between gap-2">
                    <div>
                      {product.promoPrice && (
                        <span className="block text-xs line-through text-[#A0A4AB] font-mono-tabular">
                          {formatBRL(product.price)}
                        </span>
                      )}
                      <span className="font-mono-tabular text-base font-bold text-[#E2B743]">
                        {formatBRL(finalPrice)}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        addToCart(product.id, 1);
                        onOpenCart();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#222428] border border-[#2C2E33] text-xs font-semibold text-white hover:bg-[#E2B743] hover:text-[#0D0E10] hover:border-[#E2B743] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {outOfStock ? 'Indisponível' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HORÁRIO E ATENDIMENTO */}
      <section id="horario" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Horários dinâmicos */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#2C2E33]">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">
              <Clock className="w-4 h-4" />
              <span>Horário e Atendimento</span>
            </div>
            <h2 className="font-display text-3xl uppercase text-white mt-2">
              Quando Estamos Abertos
            </h2>
            <p className="text-sm text-[#A0A4AB] mt-1 mb-6">
              Atendimento com hora marcada e encaixes sujeitos à disponibilidade da cadeira.
            </p>

            <div className="divide-y divide-[#2C2E33]">
              {settings.schedule.map((day) => {
                const isToday = day.dayIndex === todayIndex;
                return (
                  <div
                    key={day.dayIndex}
                    className={`flex items-center justify-between py-3 text-sm ${
                      isToday ? 'text-[#E2B743] font-semibold' : 'text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{day.dayLabel}</span>
                      {isToday && <span className="text-xs text-[#F4D013]">(Hoje)</span>}
                    </div>
                    <span className={`font-mono-tabular ${day.closed ? 'text-[#A0A4AB]' : ''}`}>
                      {day.closed ? 'Fechado' : `${day.open} – ${day.close}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Localização & Canais */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#141518]">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">
                Localização &amp; Contato
              </p>
              <h3 className="font-display text-2xl uppercase text-white mt-2">
                Visite a Barbearia Edyk
              </h3>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#E2B743] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">{settings.address}</div>
                    <div className="text-[#A0A4AB]">{settings.neighborhood}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#E2B743] shrink-0" />
                  <span className="font-mono-tabular text-white">{settings.phone}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-[#E2B743] shrink-0" />
                  <a
                    href={`https://instagram.com/${settings.instagramHandle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#E2B743] transition-colors"
                  >
                    {settings.instagramHandle}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-[#25D366] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2"
              >
                Chamar no WhatsApp
              </a>
              <button
                type="button"
                onClick={() => onStartBooking()}
                className="w-full py-3.5 px-5 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors cursor-pointer"
              >
                Agendar Horário Online
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
