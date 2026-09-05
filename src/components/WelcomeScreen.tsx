import React from 'react';
import { Sparkles, Code2, Compass, PenTool, Lightbulb, ArrowUpRight } from 'lucide-react';

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

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName = 'Ruan',
  onSelectPrompt,
}) => {
  const cardsToDisplay: PromptCard[] = [
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

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
      {/* Top Greeting */}
      <div className="mt-8 sm:mt-16 space-y-3">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
          <span className="gemini-gradient-text block leading-tight">
            Olá, {userName}
          </span>
          <span className="text-neutral-400 font-medium text-3xl sm:text-4xl md:text-5xl block mt-1">
            Como posso ajudar você hoje?
          </span>
        </h1>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-8">
        {cardsToDisplay.map((card, i) => (
          <button
            key={i}
            id={`suggestion-card-${i}`}
            onClick={() => onSelectPrompt(card.prompt)}
            className="group relative flex flex-col justify-between p-4 h-36 sm:h-44 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-white/5 hover:border-white/15 text-left transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <span className="font-semibold text-sm text-neutral-200 group-hover:text-white block">
                {card.title}
              </span>
              <p className="text-xs text-neutral-400 group-hover:text-neutral-300 mt-1 line-clamp-3 leading-relaxed">
                {card.subtitle}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2">
              <div className="p-2 rounded-xl bg-white/5 text-neutral-300 group-hover:text-white group-hover:bg-white/10 transition-colors">
                {card.icon}
              </div>
              <ArrowUpRight
                size={16}
                className="text-neutral-500 group-hover:text-white transition-colors"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
