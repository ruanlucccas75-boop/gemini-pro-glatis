import React from 'react';
import { Code2, Compass, PenTool, Lightbulb, ArrowUpRight } from 'lucide-react';

interface WelcomeScreenProps {
  userName?: string;
  onSelectPrompt: (prompt: string) => void;
}

interface PromptCard {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  prompt: string;
}

const WELCOME_CARDS: PromptCard[] = [
  {
    title: 'Explicar um conceito',
    subtitle: 'Entenda tópicos complexos ou teorias científicas de forma simples',
    icon: <Lightbulb size={20} className="text-amber-400" />,
    prompt: 'Explique a física quântica e o entrelaçamento quântico de forma simples e intuitiva.',
  },
  {
    title: 'Programar & Depurar',
    subtitle: 'Crie componentes, resolva bugs ou otimize consultas',
    icon: <Code2 size={20} className="text-emerald-400" />,
    prompt: 'Escreva um exemplo prático em TypeScript de um debounce hook com cancelamento.',
  },
  {
    title: 'Planejar roteiro',
    subtitle: 'Crie planos de viagem, eventos ou rotinas de estudo',
    icon: <Compass size={20} className="text-blue-400" />,
    prompt: 'Planeje um roteiro de viagem de 4 dias no Rio de Janeiro com opções gastronômicas e culturais.',
  },
  {
    title: 'Escrever e revisar',
    subtitle: 'Elabore e-mails persuasivos, ensaios ou posts para redes',
    icon: <PenTool size={20} className="text-rose-400" />,
    prompt: 'Escreva uma proposta formal de prestação de serviços de consultoria tecnológica.',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = React.memo(({
  userName = 'Ruan',
  onSelectPrompt,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
      {/* Astra Hero Cover Card */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/25 bg-[#1e1f20] shadow-[0_8px_30px_rgba(0,0,0,0.5)] group">
        {/* Cover Image */}
        <div className="relative h-32 sm:h-44 md:h-52 w-full overflow-hidden">
          <img
            src="/astra-cover.jpg"
            alt="Capa Astra Artificial Intelligence"
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f20] via-[#1e1f20]/40 to-transparent" />

          {/* Floating Brand Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#131314]/80 backdrop-blur-md border border-cyan-400/40 text-[11px] sm:text-xs font-semibold text-cyan-200 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>ASTRA • ARTIFICIAL INTELLIGENCE</span>
          </div>
        </div>

        {/* Cover Title Area */}
        <div className="p-4 sm:p-5 pt-1 bg-[#1e1f20] border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent block leading-tight">
                  Olá, {userName}
                </span>
                <span className="text-neutral-300 font-medium text-lg sm:text-xl md:text-2xl block mt-0.5">
                  Como a Astra pode ajudar você hoje?
                </span>
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Astra Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {WELCOME_CARDS.map((card, i) => (
          <button
            key={i}
            id={`suggestion-card-${i}`}
            onClick={() => onSelectPrompt(card.prompt)}
            className="group relative flex flex-col justify-between p-3.5 h-28 sm:h-32 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-white/5 hover:border-cyan-400/30 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
          >
            <div>
              <span className="font-semibold text-xs sm:text-sm text-neutral-200 group-hover:text-white block truncate">
                {card.title}
              </span>
              <p className="text-[11px] text-neutral-400 group-hover:text-neutral-300 mt-0.5 line-clamp-2 leading-relaxed">
                {card.subtitle}
              </p>
            </div>

            <div className="flex items-center justify-between mt-1 pt-1">
              <div className="p-1.5 rounded-lg bg-white/5 text-neutral-300 group-hover:text-white group-hover:bg-white/10 transition-colors">
                {card.icon}
              </div>
              <ArrowUpRight
                size={14}
                className="text-neutral-500 group-hover:text-white transition-colors"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';
