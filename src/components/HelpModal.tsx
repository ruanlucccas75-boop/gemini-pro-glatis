import React from 'react';
import { X, HelpCircle, CornerDownLeft, Image, Globe, Brain, Mic } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl p-6 text-neutral-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-[#a8c7fa]" />
            <h2 className="text-lg font-semibold text-white">Central de Ajuda</h2>
          </div>
          <button
            id="close-help-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-5 text-xs text-neutral-300">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
              Atalhos úteis
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#282a2c]">
                <span>Enviar mensagem</span>
                <kbd className="px-2 py-1 rounded bg-black/40 text-neutral-300 font-mono text-[11px] border border-white/10">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#282a2c]">
                <span>Pular linha no texto</span>
                <kbd className="px-2 py-1 rounded bg-black/40 text-neutral-300 font-mono text-[11px] border border-white/10">
                  Shift + Enter
                </kbd>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
              Recursos disponíveis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#282a2c] flex items-start gap-2.5">
                <Globe size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Pesquisa na Web</div>
                  <p className="text-neutral-400 mt-0.5">
                    Acesso a fatos e notícias recentes via Google Search.
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#282a2c] flex items-start gap-2.5">
                <Brain size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Modo Raciocínio</div>
                  <p className="text-neutral-400 mt-0.5">
                    Resolução passo a passo de lógica, matemática e código.
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#282a2c] flex items-start gap-2.5">
                <Image size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Upload de Imagens</div>
                  <p className="text-neutral-400 mt-0.5">
                    Análise e interpretação multimodal de fotos e diagramas.
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#282a2c] flex items-start gap-2.5">
                <Mic size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Voz e Leitura</div>
                  <p className="text-neutral-400 mt-0.5">
                    Ditado por microfone e síntese de voz (áudio).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            id="help-done-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white text-black font-medium text-xs hover:bg-neutral-200 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
