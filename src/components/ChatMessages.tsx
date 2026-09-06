import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  RotateCcw,
  Share2,
  ExternalLink,
  Edit3,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  ArrowDownCircle,
} from 'lucide-react';
import { Message } from '../types';
import { GeminiLogo } from './GeminiLogo';
import { MarkdownRenderer } from './MarkdownRenderer';
import { calculateReadingStats } from '../utils/readingTime';
import { NEXT_VERSION } from '../utils/updateService';

interface ChatMessagesProps {
  messages: Message[];
  userEmail?: string;
  isStreaming: boolean;
  onRegenerate: () => void;
  onEditPrompt: (text: string) => void;
  onOpenUpdateModal?: () => void;
  isUpdateAvailable?: boolean;
}

// Memoized User Message Item
const UserMessageItem = React.memo<{
  msg: Message;
  userEmail: string;
  onEditPrompt: (text: string) => void;
}>(({ msg, userEmail, onEditPrompt }) => {
  return (
    <div className="flex flex-col items-end group">
      <div className="flex items-start gap-3 max-w-2xl">
        <div className="flex flex-col items-end space-y-2">
          {/* Attached images preview */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end mb-1">
              {msg.attachments.map((att) => (
                <div
                  key={att.id}
                  className="relative rounded-xl overflow-hidden border border-white/10 max-w-xs shadow-md"
                >
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="max-h-48 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs px-2 py-1 text-[10px] text-neutral-300 truncate">
                    {att.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message bubble */}
          <div className="px-4 py-3 rounded-3xl bg-[#282a2c] text-white text-sm sm:text-base leading-relaxed break-words shadow-sm">
            {msg.content}
          </div>

          {/* Action row (Edit prompt) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              id={`edit-prompt-btn-${msg.id}`}
              onClick={() => onEditPrompt(msg.content)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Editar pergunta"
            >
              <Edit3 size={13} />
              <span>Editar</span>
            </button>
          </div>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a73e8] to-[#9c27b0] flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm mt-1 select-none">
          {userEmail.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
});

UserMessageItem.displayName = 'UserMessageItem';

// Memoized Model Message Item
const ModelMessageItem = React.memo<{
  msg: Message;
  isLastMessage: boolean;
  onRegenerate: () => void;
  copied: boolean;
  onCopy: (id: string, text: string) => void;
  liked: 'up' | 'down' | null;
  onToggleLike: (id: string, type: 'up' | 'down') => void;
  isSpeaking: boolean;
  onToggleSpeak: (id: string, text: string) => void;
  onOpenUpdateModal?: () => void;
  isUpdateAvailable?: boolean;
}>(({
  msg,
  isLastMessage,
  onRegenerate,
  copied,
  onCopy,
  liked,
  onToggleLike,
  isSpeaking,
  onToggleSpeak,
  onOpenUpdateModal,
  isUpdateAvailable,
}) => {
  // Compute reading stats only when content changes and message is not streaming
  const readingStats = useMemo(() => {
    return !msg.isStreaming ? calculateReadingStats(msg.content) : null;
  }, [msg.content, msg.isStreaming]);

  return (
    <div className="flex items-start gap-3 sm:gap-4 max-w-3xl">
      {/* Astra Logo */}
      <div className="shrink-0 mt-1">
        <div className="relative">
          <img
            src="/astra-logo.jpg"
            alt="Astra"
            className={`w-6 h-6 rounded-full object-cover ring-1 ring-cyan-400/50 shadow-xs ${
              msg.isStreaming ? 'animate-pulse ring-cyan-300 ring-2' : ''
            }`}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Content & Actions */}
      <div className="flex-1 min-w-0 space-y-3">
        {msg.error &&
        !msg.error.includes('alta demanda') &&
        !msg.error.includes('contingência') &&
        !msg.error.includes('contingencia') &&
        !msg.error.includes('503') &&
        !msg.error.includes('UNAVAILABLE') ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>{msg.error}</p>
              <button
                id="retry-btn"
                onClick={onRegenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-medium transition-colors"
              >
                <RotateCcw size={13} />
                <span>Tentar novamente</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Estimated reading time badge for long responses */}
            {readingStats && (
              <div className="flex items-center gap-2 mb-1">
                <div
                  id={`reading-time-badge-${msg.id}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-neutral-300 bg-white/[0.05] border border-white/10 hover:border-[#a8c7fa]/40 hover:bg-white/[0.08] transition-all select-none shadow-2xs"
                  title={`Tempo estimado de leitura: ${readingStats.label} (${readingStats.wordCount} palavras • ~200 palavras/minuto)`}
                >
                  <Clock size={12} className="text-[#a8c7fa] shrink-0" />
                  <span>{readingStats.label}</span>
                  <span className="text-neutral-500 text-[10px]">•</span>
                  <span className="text-neutral-400 text-[11px]">{readingStats.wordCount} palavras</span>
                </div>
              </div>
            )}

            <div className="text-neutral-200 text-sm sm:text-base leading-relaxed">
              <MarkdownRenderer
                content={
                  msg.content ||
                  (msg.isStreaming
                    ? ''
                    : 'Olá! Estou pronta para te ajudar. Como posso prosseguir com sua solicitação?')
                }
              />
              {msg.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#a8c7fa] animate-pulse rounded-xs align-middle" />
              )}
            </div>

            {/* Web Search Grounding Sources */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
                <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  Fontes da pesquisa:
                </div>
                <div className="flex flex-wrap gap-2">
                  {msg.sources.map((src, sIdx) => (
                    <a
                      key={sIdx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a8c7fa] hover:text-white transition-colors max-w-xs truncate"
                    >
                      <span className="truncate">{src.title || src.url}</span>
                      <ExternalLink size={11} className="shrink-0 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* In-chat interactive update card */}
            {onOpenUpdateModal &&
              (msg.isUpdatePrompt ||
                (isUpdateAvailable &&
                  (/atualiz/i.test(msg.content) ||
                    /update/i.test(msg.content) ||
                    /v2\.5\.0/i.test(msg.content)) &&
                  !msg.content.includes('sucesso para a versão'))) && (
                <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#24283b]/80 to-[#1e1f20] border border-cyan-400/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Atualização Disponível da Astra</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 font-mono">
                          {NEXT_VERSION}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        Clique no botão para atualizar agora diretamente no aplicativo.
                      </p>
                    </div>
                  </div>
                  <button
                    id={`chat-update-btn-${msg.id}`}
                    onClick={onOpenUpdateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
                  >
                    <Zap size={14} />
                    <span>Atualizar no App</span>
                    <ArrowDownCircle size={14} />
                  </button>
                </div>
              )}

            {/* Action Bar */}
            {!msg.isStreaming && (
              <div className="flex items-center gap-1 sm:gap-2 pt-2 text-neutral-400 text-xs">
                {/* Copy */}
                <button
                  id={`copy-msg-btn-${msg.id}`}
                  onClick={() => onCopy(msg.id, msg.content)}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  title="Copiar resposta"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>

                {/* Thumbs Up */}
                <button
                  id={`like-up-btn-${msg.id}`}
                  onClick={() => onToggleLike(msg.id, 'up')}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    liked === 'up'
                      ? 'text-[#a8c7fa] bg-[#1f2638]'
                      : 'hover:text-white'
                  }`}
                  title="Boa resposta"
                >
                  <ThumbsUp size={16} />
                </button>

                {/* Thumbs Down */}
                <button
                  id={`like-down-btn-${msg.id}`}
                  onClick={() => onToggleLike(msg.id, 'down')}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    liked === 'down'
                      ? 'text-rose-400 bg-rose-500/10'
                      : 'hover:text-white'
                  }`}
                  title="Resposta ruim"
                >
                  <ThumbsDown size={16} />
                </button>

                {/* Listen / TTS */}
                <button
                  id={`tts-btn-${msg.id}`}
                  onClick={() => onToggleSpeak(msg.id, msg.content)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    isSpeaking
                      ? 'text-[#a8c7fa] bg-[#1f2638] animate-pulse'
                      : 'hover:text-white'
                  }`}
                  title={isSpeaking ? 'Pausar áudio' : 'Ouvir resposta'}
                >
                  {isSpeaking ? (
                    <VolumeX size={16} />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>

                {/* Regenerate (if last turn) */}
                {isLastMessage && (
                  <button
                    id={`regen-btn-${msg.id}`}
                    onClick={onRegenerate}
                    className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                    title="Gerar novamente"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}

                {/* Share */}
                <button
                  id={`share-btn-${msg.id}`}
                  onClick={() => onCopy(msg.id, msg.content)}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  title="Compartilhar texto"
                >
                  <Share2 size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

ModelMessageItem.displayName = 'ModelMessageItem';

export const ChatMessages: React.FC<ChatMessagesProps> = React.memo(({
  messages,
  userEmail = 'Você',
  isStreaming,
  onRegenerate,
  onEditPrompt,
  onOpenUpdateModal,
  isUpdateAvailable,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, 'up' | 'down' | null>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAutoScrollActiveRef = useRef(true);

  // Monitor user scroll so we don't yank scroll position if they manually scrolled up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 120;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isAutoScrollActiveRef.current = atBottom;
  }, []);

  // Optimized scroll handler
  useEffect(() => {
    if (!isAutoScrollActiveRef.current) return;

    if (isStreaming) {
      // Direct instant scroll during streaming - avoids layout fighting and 60fps smooth anim queue
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    } else {
      // Gentle scroll once generation finishes or initial load
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, messages[messages.length - 1]?.content, isStreaming]);

  // Cancel speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleToggleSpeak = useCallback((id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }, [speakingId]);

  const handleToggleLike = useCallback((id: string, type: 'up' | 'down') => {
    setLikedMap((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  }, []);

  const lastIndex = messages.length - 1;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-4xl w-full mx-auto"
    >
      {messages.map((msg, index) => {
        const isLast = index === lastIndex;

        if (msg.role === 'user') {
          return (
            <UserMessageItem
              key={msg.id}
              msg={msg}
              userEmail={userEmail}
              onEditPrompt={onEditPrompt}
            />
          );
        }

        return (
          <ModelMessageItem
            key={msg.id}
            msg={msg}
            isLastMessage={isLast}
            onRegenerate={onRegenerate}
            copied={copiedId === msg.id}
            onCopy={handleCopy}
            liked={likedMap[msg.id] || null}
            onToggleLike={handleToggleLike}
            isSpeaking={speakingId === msg.id}
            onToggleSpeak={handleToggleSpeak}
            onOpenUpdateModal={onOpenUpdateModal}
            isUpdateAvailable={isUpdateAvailable}
          />
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';
