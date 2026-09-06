import React from 'react';
import { X, Moon, Sun, Trash2, Shield, Info, Check, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onClearAllChats: () => void;
  onOpenUpdateModal?: () => void;
  installedVersion?: string;
  hasUpdate?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  onClearAllChats,
  onOpenUpdateModal,
  installedVersion,
  hasUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl p-6 text-neutral-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Configurações</h2>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-6">
          {/* Appearance */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Aparência
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#282a2c]">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                <div>
                  <div className="text-sm font-medium text-white">Tema Escuro</div>
                  <div className="text-xs text-neutral-400">
                    Alternar entre modo claro e escuro
                  </div>
                </div>
              </div>
              <button
                id="toggle-dark-mode-setting"
                onClick={onToggleDarkMode}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
              >
                {isDarkMode ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>

          {/* Privacy & History */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Privacidade & Conversas
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#282a2c]">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-rose-400" />
                <div>
                  <div className="text-sm font-medium text-white">
                    Limpar histórico de chats
                  </div>
                  <div className="text-xs text-neutral-400">
                    Apagar todas as conversas salvas localmente
                  </div>
                </div>
              </div>
              <button
                id="clear-chats-btn"
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar todas as conversas?')) {
                    onClearAllChats();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Behavior / Instructions */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Comportamento do Assistente
            </h3>
            <div className="p-3 rounded-xl bg-[#282a2c] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Modo Direto e Resolutivo</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                  Ativo
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                O modelo foi configurado para cumprir exatamente o que você solicitar sem reclamar, sem lições de moral e entregando códigos e respostas completas na hora.
              </p>
            </div>
          </div>

          {/* App Updates */}
          {onOpenUpdateModal && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Atualizações do Aplicativo
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#282a2c]">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${hasUpdate ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-neutral-300'}`}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <span>Versão Instalada</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono">
                        {installedVersion || 'v2.4.2'}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400">
                      {hasUpdate ? 'Nova atualização disponível para download!' : 'Você está utilizando a versão mais recente.'}
                    </div>
                  </div>
                </div>
                <button
                  id="settings-check-update-btn"
                  onClick={() => {
                    onClose();
                    onOpenUpdateModal();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    hasUpdate
                      ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {hasUpdate ? 'Atualizar Agora' : 'Verificar'}
                </button>
              </div>
            </div>
          )}

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Sobre o Aplicativo
            </h3>
            <div className="p-3 rounded-xl bg-[#282a2c] space-y-2 text-xs text-neutral-400">
              <div className="flex items-center justify-between text-white font-medium">
                <span>Versão do Astra</span>
                <span className="text-cyan-300">Astra 3.8 Series</span>
              </div>
              <p>
                Astra Inteligência Artificial - Plataforma avançada com suporte a modelos de alta performance, visão computacional, pesquisa na web e raciocínio lógico.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            id="settings-done-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white text-black font-medium text-xs hover:bg-neutral-200 transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
