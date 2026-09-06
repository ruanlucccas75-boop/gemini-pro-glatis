import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowDownCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck,
  Check,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  AppUpdate,
  LATEST_UPDATE,
  getInstalledVersion,
  setInstalledVersion,
  NEXT_VERSION,
  BASE_VERSION,
  resetUpdateForDemo,
} from '../utils/updateService';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCompleted: (newVersion: string) => void;
  onResetUpdate?: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  onUpdateCompleted,
  onResetUpdate,
}) => {
  const [currentVersion, setCurrentVersion] = useState<string>(getInstalledVersion());
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentVersion(getInstalledVersion());
      setIsUpdating(false);
      setProgress(0);
      setUpdateSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasNewVersion = currentVersion !== NEXT_VERSION;

  const handleStartUpdate = () => {
    setIsUpdating(true);
    setProgress(0);
    setCurrentStep('Conectando aos servidores da Astra...');

    const steps = [
      { p: 15, msg: 'Conectando e verificando assinatura digital...' },
      { p: 35, msg: `Baixando pacote do Astra ${NEXT_VERSION} (${LATEST_UPDATE.sizeMb})...` },
      { p: 60, msg: 'Instalando novos pesos de IA e motor de raciocínio...' },
      { p: 85, msg: 'Atualizando interface e limpando arquivos temporários...' },
      { p: 100, msg: `Astra ${NEXT_VERSION} atualizada com sucesso!` },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex].p);
        setCurrentStep(steps[stepIndex].msg);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setInstalledVersion(NEXT_VERSION);
          setCurrentVersion(NEXT_VERSION);
          setIsUpdating(false);
          setUpdateSuccess(true);
          onUpdateCompleted(NEXT_VERSION);
        }, 500);
      }
    }, 600);
  };

  const handleResetForTesting = () => {
    resetUpdateForDemo();
    setCurrentVersion(BASE_VERSION);
    setUpdateSuccess(false);
    setProgress(0);
    setIsUpdating(false);
    onResetUpdate?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUpdating) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#1e1f20] border border-white/15 shadow-2xl overflow-hidden relative text-white flex flex-col">
        {/* Glow Header */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-500/25 via-indigo-500/15 to-transparent blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Atualização do Sistema Astra</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  {NEXT_VERSION}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Instale melhorias e novos recursos diretamente no aplicativo
              </p>
            </div>
          </div>

          {!isUpdating && (
            <button
              id="close-update-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 relative z-10 max-h-[75vh] overflow-y-auto">
          {/* Current vs New Version Badge Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-400 block text-[11px]">Versão Instalada</span>
              <span className="font-semibold text-white text-sm">{currentVersion}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500">→</span>
              <div className="text-right">
                <span className="text-neutral-400 block text-[11px]">Última Versão</span>
                <span className="font-semibold text-cyan-300 text-sm">{NEXT_VERSION}</span>
              </div>
            </div>

            <div className="text-right">
              {hasNewVersion ? (
                <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold animate-pulse">
                  Atualização Disponível
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <Check size={12} />
                  <span>Atualizado</span>
                </span>
              )}
            </div>
          </div>

          {/* Active Updating View */}
          {isUpdating ? (
            <div className="py-6 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-300 shadow-lg animate-pulse">
                <RefreshCw size={28} className="animate-spin" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">
                  Atualizando a Astra... {progress}%
                </h3>
                <p className="text-xs text-cyan-300/90 font-mono h-5">
                  {currentStep}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-[11px] text-neutral-400">
                Por favor, aguarde. Seus dados e conversas serão preservados.
              </p>
            </div>
          ) : updateSuccess ? (
            /* Update Completed Screen */
            <div className="py-6 space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white">
                  Astra Atualizada com Sucesso!
                </h3>
                <p className="text-xs text-neutral-300">
                  O aplicativo foi atualizado para a versão <strong className="text-emerald-300">{NEXT_VERSION}</strong> diretamente no seu navegador.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 text-left space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Novos recursos prontos para uso:</span>
                </p>
                <p className="text-[11px] text-neutral-300">
                  Respostas otimizadas, raciocínio avançado habilitado e pesquisa em tempo real atualizada.
                </p>
              </div>

              <button
                id="finish-update-btn"
                onClick={() => {
                  onClose();
                  // Instant soft state reload or notification
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
              >
                Concluir e Continuar Conversando
              </button>
            </div>
          ) : (
            /* Normal Details & Changelog View */
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap size={14} className="text-cyan-400" />
                  <span>O que há de novo na versão {NEXT_VERSION}:</span>
                </h4>
                <div className="space-y-2">
                  {LATEST_UPDATE.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-300 flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
                        ✓
                      </span>
                      <span className="text-neutral-200 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              {hasNewVersion ? (
                <div className="space-y-2 pt-2">
                  <button
                    id="install-update-now-btn"
                    onClick={handleStartUpdate}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-xl shadow-cyan-500/20 cursor-pointer group"
                  >
                    <ArrowDownCircle size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    <span>Atualizar Agora Diretamente no App</span>
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center">
                    A atualização é baixada e aplicada instantaneamente sem fechar ou desinstalar nada.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Seu Astra já está na versão mais recente ({NEXT_VERSION}).</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="reinstall-update-btn"
                      onClick={handleStartUpdate}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors cursor-pointer"
                    >
                      Reinstalar Atualização
                    </button>
                    <button
                      id="reset-demo-update-btn"
                      onClick={handleResetForTesting}
                      className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Voltar para versão anterior para testar a notificação e atualização de novo"
                    >
                      <RotateCcw size={14} />
                      <span>Simular Nova Atualização</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
