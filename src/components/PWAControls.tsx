import React, { useState } from 'react';
import { Download, Share, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2B743]/50 bg-[#E2B743]/10 text-[#E2B743] hover:bg-[#E2B743] hover:text-[#0D0E10] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          compact ? 'px-3 py-2 text-xs font-semibold' : 'px-4 py-2.5 text-sm font-semibold'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        Instalar App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#2C2E33] bg-[#18191C] text-[#E2B743] hover:border-[#E2B743]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            compact ? 'px-3 py-2 text-xs font-medium' : 'px-4 py-2.5 text-sm font-medium'
          }`}
        >
          <Share className="w-4 h-4 shrink-0" />
          Instalar no iPhone
        </button>

        {showGuide && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg uppercase text-white">Instalar EDY-K no iOS</h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Fechar instruções"
                  className="p-2 rounded-lg text-[#A0A4AB] hover:text-white hover:bg-[#222428] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="space-y-3 text-sm text-[#A0A4AB] leading-relaxed">
                <li>
                  <strong className="text-white">1.</strong> Toque no botão <strong className="text-[#E2B743]">Compartilhar</strong> na barra inferior do Safari.
                </li>
                <li>
                  <strong className="text-white">2.</strong> Role para baixo e selecione <strong className="text-[#E2B743]">Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  <strong className="text-white">3.</strong> Toque em <strong className="text-white">Adicionar</strong> para acessar a EDY-K como aplicativo nativo.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-6 w-full py-2.5 rounded-lg bg-[#E2B743] text-[#0D0E10] font-semibold text-sm hover:bg-[#C89D2B] transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-5 left-4 z-50 flex items-center gap-2 rounded-lg border border-[#E2B743]/40 bg-[#18191C]/95 px-3.5 py-2 text-xs font-medium text-[#E2B743] shadow-xl backdrop-blur-md"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Modo offline — exibindo dados salvos localmente</span>
    </div>
  );
};
