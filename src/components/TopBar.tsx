import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Sparkles, HelpCircle, Check, Zap, Brain, ShieldCheck, LogIn, LogOut, UserCheck, Cpu } from 'lucide-react';
import { ModelId, ModelOption, UserProfile } from '../types';

interface TopBarProps {
  onToggleSidebar: () => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  onOpenHelp: () => void;
  onOpenAdvancedModal: () => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  isUpdateAvailable?: boolean;
  onOpenUpdateModal?: () => void;
  installedVersion?: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Astra Flash Lite',
    badge: 'Mais Rápido',
    description: 'Respostas quase instantâneas com a menor latência e máxima disponibilidade contínua.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Astra 3.8 Flash',
    badge: 'Padrão',
    description: 'Equilíbrio ideal entre inteligência e velocidade para conversas diárias.',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Astra Flash Turbo',
    badge: 'Alta Estabilidade',
    description: 'Alta velocidade com rotas otimizadas contra picos de demanda nos servidores.',
  },
  {
    id: 'gemini-flash-thinking',
    name: 'Astra 3.8 Thinking',
    badge: 'Raciocínio',
    description: 'Processo analítico passo a passo para problemas complexos e lógica apurada.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Astra 3.1 Pro',
    badge: 'Avançado',
    description: 'Modelo de alta capacidade para tarefas profundas e programação avançada.',
    isPro: false,
  },
];

export const TopBar: React.FC<TopBarProps> = React.memo(({
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  onOpenHelp,
  onOpenAdvancedModal,
  currentUser,
  onOpenLogin,
  onLogout,
  isUpdateAvailable,
  onOpenUpdateModal,
  installedVersion,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setModelDropdownOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 px-3 sm:px-4 flex items-center justify-between border-b border-white/5 bg-[#131314] z-20 select-none">
      {/* Left side: Hamburger & Title / Model dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
          title="Menu principal"
        >
          <Menu size={20} />
        </button>

        {/* Model dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="model-selector-btn"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors group"
          >
            <img
              src="/astra-logo.jpg"
              alt="Astra"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-400/40 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent flex items-center gap-1.5">
              Astra
            </span>
            <span className="text-xs text-neutral-400 font-medium ml-0.5 hidden md:inline-block">
              {currentModel.name.replace('Astra ', '')}
            </span>
            <ChevronDown
              size={16}
              className={`text-neutral-400 transition-transform duration-200 ${
                modelDropdownOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* Model selection dropdown menu */}
          {modelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 max-w-[94vw] rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col">
              {/* Header with counter and scroll hint */}
              <div className="px-3.5 py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between select-none">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Modelos de IA da Astra
                </span>
                <span className="text-[10px] text-cyan-300 font-medium px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 flex items-center gap-1">
                  <span>{AVAILABLE_MODELS.length} IAs</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-[10px] text-neutral-400">role para ver</span>
                </span>
              </div>

              {/* Scrollable list with visible scrollbar */}
              <div
                id="models-scrollable-container"
                className="p-2 space-y-1.5 max-h-[290px] sm:max-h-[330px] overflow-y-auto overflow-x-hidden scrollbar-visible pr-1.5 focus:outline-none"
              >
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      id={`model-option-${model.id}`}
                      onClick={() => {
                        onSelectModel(model.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 text-white border border-cyan-400/40 shadow-xs'
                          : 'hover:bg-white/5 text-neutral-300 border border-transparent'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {model.id === 'gemini-flash-thinking' ? (
                            <Brain size={16} className="text-purple-400 shrink-0" />
                          ) : model.id === 'gemini-3.1-pro-preview' ? (
                            <Cpu size={16} className="text-amber-400 shrink-0" />
                          ) : model.id === 'gemini-3.1-flash-lite' ? (
                            <Zap size={16} className="text-emerald-400 shrink-0" />
                          ) : (
                            <Sparkles size={16} className="text-cyan-400 shrink-0" />
                          )}
                          <span className="font-semibold text-sm text-white truncate">
                            {model.name}
                          </span>
                          {model.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                model.isPro
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : model.id === 'gemini-flash-thinking'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : model.id === 'gemini-3.1-flash-lite'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 leading-normal">
                          {model.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-cyan-400 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom footer bar */}
              <div className="p-2 border-t border-white/10 bg-black/30">
                <button
                  id="unlimited-info-btn"
                  onClick={() => {
                    setModelDropdownOpen(false);
                    onOpenAdvancedModal();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-emerald-400 hover:bg-emerald-500/10 font-medium transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    Uso Livre & Sem Cobrança de Tokens
                  </span>
                  <span className="text-[11px] text-neutral-400">Ver detalhes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Unlimited badge, Help icon, Profile avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* In-app Update Button Indicator */}
        {isUpdateAvailable && onOpenUpdateModal && (
          <button
            id="topbar-update-btn"
            onClick={onOpenUpdateModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-indigo-500/20 border border-cyan-400/50 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-xs animate-pulse"
            title="Nova atualização da Astra disponível! Clique para atualizar agora no app"
          >
            <Sparkles size={13} className="text-cyan-400 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">Atualizar App</span>
          </button>
        )}

        <button
          id="top-unlimited-btn"
          onClick={onOpenAdvancedModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/15 transition-all shadow-sm cursor-pointer"
          title="Seus clientes usam sem limites de tokens e sem cobranças"
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Sem Limite de Tokens</span>
        </button>

        <button
          id="help-btn"
          onClick={onOpenHelp}
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
          title="Ajuda e feedback"
        >
          <HelpCircle size={18} />
        </button>

        {/* User profile avatar or Login button */}
        {currentUser ? (
          <div className="relative" ref={userMenuRef}>
            <button
              id="user-avatar-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:ring-2 hover:ring-cyan-400/50 transition-all cursor-pointer"
              title={currentUser.email}
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-base shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-neutral-400 flex items-center gap-1.5 pb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>
                    {currentUser.provider === 'google'
                      ? 'Conectado via Conta Google'
                      : currentUser.provider === 'guest'
                      ? 'Modo Visitante'
                      : 'Conta Astra Conectada'}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                  {onOpenUpdateModal && (
                    <button
                      id="topbar-menu-update-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenUpdateModal();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles size={14} className={isUpdateAvailable ? "text-cyan-400" : "text-neutral-400"} />
                        <span>Atualizações</span>
                      </span>
                      {isUpdateAvailable ? (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold">
                          Nova v2.5.0
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {installedVersion || 'v2.4.2'}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    id="switch-account-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    <UserCheck size={14} className="text-cyan-400" />
                    <span>Trocar de Conta</span>
                  </button>

                  <button
                    id="logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="topbar-login-btn"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-md cursor-pointer"
          >
            <LogIn size={14} />
            <span>Fazer Login</span>
          </button>
        )}
      </div>
    </header>
  );
});

TopBar.displayName = 'TopBar';
