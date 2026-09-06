import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (profile: UserProfile) => void;
  canDismiss?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  canDismiss = true,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'google' | 'custom'>('google');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Por favor, informe seu nome ou como prefere ser chamado(a).');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    setError('');
    const profile: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      email: cleanEmail,
      provider: activeTab,
    };
    onLogin(profile);
  };

  const handleGuestLogin = () => {
    const profile: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: 'Visitante',
      email: 'visitante@astra.local',
      provider: 'guest',
    };
    onLogin(profile);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-[#1e1f20] border border-white/15 shadow-2xl overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Cover Preview Header */}
        <div className="relative h-32 w-full overflow-hidden">
          <img
            src="/astra-cover.jpg"
            alt="Astra Cover"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f20] via-[#1e1f20]/60 to-transparent" />

          {canDismiss && onClose && (
            <button
              id="close-login-modal-btn"
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          )}

          <div className="absolute bottom-3 left-5 flex items-center gap-2.5">
            <img
              src="/astra-logo.jpg"
              alt="Astra Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                Entrar no Astra
              </h2>
              <p className="text-xs text-cyan-300 font-medium">
                Conecte sua própria conta
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Informe seus dados para personalizar a Astra com seu nome e salvar suas próprias conversas de forma individual.
          </p>

          {/* Login Options Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 text-xs">
            <button
              type="button"
              id="tab-google-login"
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Conta Google</span>
            </button>
            <button
              type="button"
              id="tab-custom-login"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Outro E-mail
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Seu Nome (como deseja ser chamado)
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="login-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Seu Nome"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 focus:border-cyan-400/60 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                {activeTab === 'google' ? 'Seu E-mail da Conta Google' : 'Seu E-mail'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'google' ? 'seuemail@gmail.com' : 'seuemail@exemplo.com'}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 focus:border-cyan-400/60 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-login-btn"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-lg cursor-pointer mt-3"
            >
              <span>{activeTab === 'google' ? 'Entrar com Minha Conta Google' : 'Entrar com Meu E-mail'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Footer note and guest option */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck size={14} />
              <span>Privacidade individual</span>
            </div>

            <button
              type="button"
              id="guest-login-btn"
              onClick={handleGuestLogin}
              className="text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Continuar como visitante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
