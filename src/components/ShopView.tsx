import React, { useMemo, useState } from 'react';
import { Minus, Plus, Search, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { formatBRL } from '../utils/format';

interface ShopViewProps {
  onOpenCart: () => void;
}

const CATEGORIES: Array<'Todos' | ProductCategory> = [
  'Todos',
  'Pomadas',
  'Óleos para Barba',
  'Shampoos',
  'Kits',
];

export const ShopView: React.FC<ShopViewProps> = ({ onOpenCart }) => {
  const { products, cart, addToCart, updateCartQuantity } = useStore();
  const [category, setCategory] = useState<'Todos' | ProductCategory>('Todos');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.active) return false;
      if (category !== 'Todos' && p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [products, category, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#E2B743]">
            Catálogo Oficial
          </p>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
            Loja EDY-K Barbershop
          </h1>
          <p className="text-sm text-[#A0A4AB] mt-1">
            Retire na barbearia sem custo ou receba via motoboy com estoque atualizado em tempo real.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#A0A4AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Buscar produto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[#2C2E33] bg-[#18191C] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8">
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#E2B743] text-[#0D0E10] font-semibold'
                  : 'bg-[#18191C] border border-[#2C2E33] text-[#A0A4AB] hover:text-white hover:border-[#E2B743]/50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#2C2E33] bg-[#18191C] py-16 text-center px-4">
          <ShoppingBag className="w-10 h-10 text-[#A0A4AB] mx-auto mb-3" />
          <h2 className="font-display text-xl uppercase text-white">Nenhum produto encontrado</h2>
          <p className="text-sm text-[#A0A4AB] mt-1">Tente limpar a busca ou selecionar outra categoria.</p>
          <button
            type="button"
            onClick={() => {
              setCategory('Todos');
              setQuery('');
            }}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[#E2B743] text-[#0D0E10] text-sm font-semibold cursor-pointer"
          >
            Mostrar Todos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => {
            const unitPrice = product.promoPrice ?? product.price;
            const inCart = cart.find((c) => c.productId === product.id);
            const outOfStock = product.stock <= 0;

            return (
              <article
                key={product.id}
                className="group rounded-2xl border border-[#2C2E33] bg-[#18191C] overflow-hidden flex flex-col hover:border-[#E2B743]/60 transition-colors"
              >
                <div className="aspect-[4/3] bg-[#0D0E10] overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                      <span className="font-display text-lg uppercase tracking-widest text-white">
                        Esgotado
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-[#A0A4AB] mb-1">
                      <span>{product.category}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className={product.stock <= 3 && product.stock > 0 ? 'text-[#F4D013]' : ''}>
                        {outOfStock ? 'Sem estoque' : `${product.stock} un. disponíveis`}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-white leading-snug">
                      {product.name}
                    </h2>
                    <p className="text-xs text-[#A0A4AB] mt-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#2C2E33] flex items-center justify-between gap-2">
                    <div>
                      {product.promoPrice && (
                        <span className="block text-xs line-through text-[#A0A4AB] font-mono-tabular">
                          {formatBRL(product.price)}
                        </span>
                      )}
                      <span className="font-mono-tabular text-lg font-bold text-[#E2B743]">
                        {formatBRL(unitPrice)}
                      </span>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-1 rounded-lg border border-[#E2B743]/60 bg-[#0D0E10] p-1">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                          aria-label="Diminuir quantidade"
                          className="w-8 h-8 flex items-center justify-center rounded text-white hover:bg-[#222428] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono-tabular text-sm font-semibold text-[#E2B743]">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={inCart.quantity >= product.stock}
                          onClick={() => updateCartQuantity(product.id, inCart.quantity + 1)}
                          aria-label="Aumentar quantidade"
                          className="w-8 h-8 flex items-center justify-center rounded text-white hover:bg-[#222428] disabled:opacity-35 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => {
                          addToCart(product.id, 1);
                          onOpenCart();
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#E2B743] text-[#0D0E10] text-xs font-bold uppercase tracking-wider hover:bg-[#C89D2B] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Comprar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
