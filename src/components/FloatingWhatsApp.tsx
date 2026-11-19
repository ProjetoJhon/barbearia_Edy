import React from 'react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();

  return (
    <a
      href={settings.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar no WhatsApp ${settings.phone}`}
      title={`WhatsApp EDY-K: ${settings.phone}`}
      className="group fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#25D366] text-[#0D0E10] shadow-lg shadow-black/50 hover:bg-[#1EBE5D] active:scale-95 transition-all h-13 px-3.5 md:px-4"
    >
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 fill-current shrink-0"
        aria-hidden="true"
      >
        <path d="M16.002 3C8.832 3 3 8.832 3 16c0 2.29.598 4.525 1.734 6.494L3 29l6.678-1.703A12.94 12.94 0 0 0 16.002 29C23.17 29 29 23.168 29 16S23.17 3 16.002 3zm0 23.63c-1.99 0-3.938-.534-5.635-1.545l-.404-.24-3.963 1.01 1.058-3.864-.263-.42A10.587 10.587 0 0 1 5.37 16c0-5.862 4.77-10.632 10.632-10.632 5.862 0 10.63 4.77 10.63 10.632 0 5.862-4.768 10.63-10.63 10.63zm5.83-7.96c-.32-.16-1.89-.933-2.183-1.04-.293-.106-.506-.16-.72.16-.213.32-.826 1.04-1.012 1.253-.186.213-.373.24-.693.08-.32-.16-1.35-.498-2.572-1.588-.95-.847-1.592-1.894-1.778-2.214-.187-.32-.02-.493.14-.652.144-.143.32-.373.48-.56.16-.186.213-.32.32-.533.106-.213.053-.4-.027-.56-.08-.16-.72-1.733-.986-2.373-.26-.624-.524-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.666 0 1.573 1.146 3.093 1.306 3.306.16.213 2.256 3.446 5.466 4.832.764.33 1.36.527 1.825.674.767.244 1.464.21 2.015.127.615-.092 1.89-.773 2.157-1.52.266-.746.266-1.386.186-1.52-.08-.133-.293-.213-.613-.373z" />
      </svg>
      <span className="hidden sm:inline text-xs font-bold tracking-wide whitespace-nowrap">
        {settings.phone}
      </span>
    </a>
  );
};
