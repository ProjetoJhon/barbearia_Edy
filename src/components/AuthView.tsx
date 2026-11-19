import React, { useState } from 'react';
import { ArrowRight, KeyRound, Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { maskPhoneBR } from '../utils/format';
import { EdykLogo } from './EdykLogo';

interface AuthViewProps {
  onSuccess: (role: 'client' | 'admin') => void;
  initialMode?: 'login' | 'register';
  adminHint?: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  initialMode = 'login',
  adminHint = false,
}) => {
  const { login, registerClient, settings } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const res = login(email, password);
      if (!res.ok) {
        setError(res.error || 'Falha ao entrar.');
        return;
      }
      onSuccess(res.user!.role);
    } else {
      if (name.trim().length < 2) {
        setError('Informe seu nome completo.');
        return;
      }
      if (!email.includes('@')) {
        setError('Informe um e-mail válido.');
        return;
      }
      if (phone.replace(/\D/g, '').length < 10) {
        setError('Informe seu WhatsApp com DDD.');
        return;
      }
      if (password.length < 4) {
        setError('Crie uma senha com pelo menos 4 caracteres.');
        return;
      }
      const res = registerClient({ name, email, phone, password });
      if (!res.ok) {
        setError(res.error || 'Erro ao criar conta.');
        return;
      }
      onSuccess('client');
    }
  };

  const quickLogin = (targetEmail: string, targetPass: string) => {
    setError('');
    const res = login(targetEmail, targetPass);
    if (res.ok && res.user) {
      onSuccess(res.user.role);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#2C2E33] bg-[#18191C] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <EdykLogo size={76} customLogoUrl={settings.customLogoUrl} />
          <h1 className="font-display text-2xl uppercase text-white mt-4 tracking-wide">
            {mode === 'login' ? 'Acessar Conta EDY-K' : 'Criar Conta de Cliente'}
          </h1>
          <p className="text-sm text-[#A0A4AB] mt-1">
            {adminHint
              ? 'Entre com o perfil Administrador para gerenciar a barbearia.'
              : 'Agende horários, acompanhe reservas e compre na loja oficial.'}
          </p>
        </div>

        {/* Mode Switch */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0D0E10] border border-[#2C2E33] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-[#E2B743] text-[#0D0E10]' : 'text-[#A0A4AB] hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-[#E2B743] text-[#0D0E10]' : 'text-[#A0A4AB] hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#A0A4AB] mb-1.5">Nome completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#A0A4AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A0A4AB] mb-1.5">WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A0A4AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(maskPhoneBR(e.target.value))}
                    className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#A0A4AB] mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A0A4AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A0A4AB] mb-1.5">Senha</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#A0A4AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#2C2E33] bg-[#222428] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-[#6B707A] focus:border-[#E2B743] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#E2B743] text-[#0D0E10] font-bold text-sm uppercase tracking-wider hover:bg-[#C89D2B] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {mode === 'login' ? 'Entrar na Conta' : 'Criar Conta Agora'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-7 pt-6 border-t border-[#2C2E33]">
          <p className="text-xs font-medium text-[#A0A4AB] text-center mb-3">
            Acesso rápido para demonstração (1 clique)
          </p>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => quickLogin('cliente@edyk.com', '123456')}
              className="w-full flex items-center justify-between rounded-xl border border-[#2C2E33] bg-[#222428] px-4 py-3 text-left hover:border-[#E2B743] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#0D0E10] border border-[#2C2E33] flex items-center justify-center text-[#E2B743] shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white group-hover:text-[#E2B743] transition-colors">
                    Entrar como Cliente Demo
                  </div>
                  <div className="text-xs font-mono-tabular text-[#A0A4AB] truncate">
                    cliente@edyk.com · 123456
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A0A4AB] group-hover:text-[#E2B743] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => quickLogin('admin@edyk.com', 'admin123')}
              className="w-full flex items-center justify-between rounded-xl border border-[#E2B743]/40 bg-[#E2B743]/10 px-4 py-3 text-left hover:bg-[#E2B743]/15 hover:border-[#E2B743] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#0D0E10] border border-[#E2B743]/40 flex items-center justify-center text-[#F4D013] shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#F4D013]">
                    Entrar como Administrador
                  </div>
                  <div className="text-xs font-mono-tabular text-[#A0A4AB] truncate">
                    admin@edyk.com · admin123
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#E2B743] shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
