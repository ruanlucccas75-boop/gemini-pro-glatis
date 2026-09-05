import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Sparkles, HelpCircle, Check, Zap, Brain, ShieldCheck } from 'lucide-react';
import { ModelId, ModelOption } from '../types';

interface TopBarProps {
  onToggleSidebar: () => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  onOpenHelp: () => void;
  onOpenAdvancedModal: () => void;
  userEmail?: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Ilimitado',
    description: 'Modelo ultrarrápido de última geração, uso livre e contínuo sem custos de token.',
  },
  {
    id: 'gemini-flash-thinking',
    name: 'Gemini 3.8 Thinking',
    badge: 'Raciocínio',
    description: 'Processo analítico passo a passo para problemas complexos e lógica, 100% liberado.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Liberado',
    description: 'Modelo topo de linha de alta capacidade e código avançado, totalmente sem custos.',
    isPro: false,
  },
];

export const TopBar: React.FC<TopBarProps> = React.memo(({
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  onOpenHelp,
  onOpenAdvancedModal,
  userEmail = 'ruanlucccas75@gmail.com',
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors group"
          >
            <span className="font-semibold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
              Gemini
            </span>
            <span className="text-xs text-neutral-400 font-medium ml-0.5 hidden md:inline-block">
              {currentModel.name.replace('Gemini ', '')}
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
            <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Selecione a versão do modelo
              </div>
              <div className="space-y-1">
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
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#282a2c] text-white border border-[#4e82ee]/30'
                          : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {model.id === 'gemini-flash-thinking' ? (
                            <Brain size={16} className="text-[#a8c7fa]" />
                          ) : (
                            <Zap size={16} className="text-[#a8c7fa]" />
                          )}
                          <span className="font-semibold text-sm text-white">
                            {model.name}
                          </span>
                          {model.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                model.isPro
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-300'
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
                        <Check size={16} className="text-[#a8c7fa] shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 px-2">
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

        {/* User profile avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-avatar-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a73e8] to-[#9c27b0] flex items-center justify-center text-white font-semibold text-sm shadow-md hover:ring-2 hover:ring-white/20 transition-all"
            title={userEmail}
          >
            {userEmail.charAt(0).toUpperCase()}
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a73e8] to-[#9c27b0] flex items-center justify-center text-white font-semibold text-base">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-sm text-white truncate">
                    Ruan Lucas
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {userEmail}
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Conectado à Conta Google</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

TopBar.displayName = 'TopBar';
