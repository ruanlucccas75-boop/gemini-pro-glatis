import React from 'react';
import { Sparkles, ArrowRight, X, Zap } from 'lucide-react';
import { NEXT_VERSION } from '../utils/updateService';

interface UpdateNotificationBannerProps {
  onOpenUpdateModal: () => void;
  onDismiss: () => void;
}

export const UpdateNotificationBanner: React.FC<UpdateNotificationBannerProps> = ({
  onOpenUpdateModal,
  onDismiss,
}) => {
  return (
    <div className="mx-4 sm:mx-6 my-2 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1f20] via-[#24283b]/90 to-[#1e1f20] border border-cyan-400/40 p-3.5 sm:p-4 shadow-xl shadow-cyan-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-48 h-12 bg-cyan-500/20 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight">
                Nova Atualização da Astra Disponível!
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                {NEXT_VERSION}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 truncate sm:whitespace-normal">
              Novas melhorias de velocidade, modo raciocínio ampliado e pesquisa na web em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            id="banner-update-btn"
            onClick={onOpenUpdateModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Zap size={14} />
            <span>Atualizar Agora</span>
            <ArrowRight size={13} />
          </button>

          <button
            id="dismiss-update-banner-btn"
            onClick={onDismiss}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Lembrar mais tarde"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
