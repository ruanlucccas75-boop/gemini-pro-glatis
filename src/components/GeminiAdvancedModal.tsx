import React from 'react';
import { X, Sparkles, Check, Zap, Brain, ShieldCheck } from 'lucide-react';

interface GeminiAdvancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProModel: () => void;
}

export const GeminiAdvancedModal: React.FC<GeminiAdvancedModalProps> = ({
  isOpen,
  onClose,
  onSelectProModel,
}) => {
  if (!isOpen) return null;

  const features = [
    {
      title: 'Zero Cobrança por Tokens para os Clientes',
      desc: 'Qualquer pessoa que acessar este aplicativo pode enviar mensagens, programar e gerar textos livremente sem precisar pagar por tokens ou cadastrar cartão.',
    },
    {
      title: 'Sem Limites Artificiais de Geração',
      desc: 'Respostas completas de até 8.192 tokens de saída e janela de contexto de mais de 1 Milhão de tokens para diálogos longos.',
    },
    {
      title: 'Todos os Modelos Liberados',
      desc: 'Gemini 3.8 Flash, Gemini 3.8 Thinking e Gemini 3.1 Pro estão 100% disponíveis no seletor para uso imediato.',
    },
    {
      title: 'Servidor Central com Processamento Otimizado',
      desc: 'As requisições passam pela sua chave de API segura no backend, protegida e transparente para os usuários finais.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-[#1e1f20] border border-white/15 shadow-2xl p-6 sm:p-8 text-neutral-200 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 text-white shadow-md">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Acesso Ilimitado & Gratuito
              </h2>
              <span className="text-xs text-emerald-400 font-medium">
                Seus clientes usam sem pagar nada por token
              </span>
            </div>
          </div>
          <button
            id="close-advanced-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="py-5 space-y-4">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                <Check size={14} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{feat.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            Acesso permanente liberado para todos os visitantes.
          </div>
          <button
            id="activate-pro-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg cursor-pointer shrink-0"
          >
            Entendido, Usar Livremente
          </button>
        </div>
      </div>
    </div>
  );
};
