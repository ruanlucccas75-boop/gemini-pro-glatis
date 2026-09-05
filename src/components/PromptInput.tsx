import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Image as ImageIcon,
  Mic,
  MicOff,
  Globe,
  Brain,
  X,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import { Attachment } from '../types';

interface PromptInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;
  isLoading: boolean;
  enableSearch: boolean;
  onToggleSearch: () => void;
  thinking: boolean;
  onToggleThinking: () => void;
  attachments: Attachment[];
  onAddAttachment: (att: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = React.memo(({
  input,
  setInput,
  onSend,
  isLoading,
  enableSearch,
  onToggleSearch,
  thinking,
  onToggleThinking,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  // Voice speech-to-text recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Seu navegador não suporta reconhecimento de voz diretamente no iframe. Experimente digitar ou usar o Chrome.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || attachments.length > 0) && !isLoading) {
        onSend();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image types
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const newAtt: Attachment = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        data: base64String,
        previewUrl: base64String,
      };
      onAddAttachment(newAtt);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Floating container */}
      <div className="relative rounded-3xl bg-[#1e1f20] border border-white/10 hover:border-white/20 focus-within:border-white/30 transition-colors shadow-lg overflow-hidden">
        {/* Attachment chips row */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-200"
              >
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="max-w-[120px] truncate">{att.name}</span>
                <button
                  id={`remove-attachment-${att.id}`}
                  onClick={() => onRemoveAttachment(att.id)}
                  className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
                  title="Remover anexo"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input area */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            id="prompt-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              enableSearch
                ? "Pergunte ao Gemini com Pesquisa na web ativada..."
                : thinking
                ? "Pergunte ao Gemini com Raciocínio lógico detalhado..."
                : "Pergunte ao Gemini..."
            }
            rows={1}
            className="w-full bg-transparent text-white placeholder-neutral-400 text-sm sm:text-base resize-none focus:outline-none leading-relaxed max-h-48"
          />
        </div>

        {/* Bottom controls & feature toggles */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left tools: Attachment, Web Search, Thinking */}
          <div className="flex items-center gap-1 sm:gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              id="file-upload-input"
            />
            <button
              id="attach-file-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Adicionar imagem"
            >
              <Paperclip size={18} />
            </button>

            {/* Web Search toggle chip */}
            <button
              id="web-search-toggle-btn"
              type="button"
              onClick={onToggleSearch}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                enableSearch
                  ? 'bg-blue-500/25 text-[#a8c7fa] border border-blue-500/40 shadow-xs'
                  : 'bg-white/5 text-neutral-300 hover:text-white border border-white/10 hover:border-white/20'
              }`}
              title="Pesquisa Google em tempo real"
            >
              <Globe size={14} className={enableSearch ? 'text-[#a8c7fa]' : 'text-neutral-400'} />
              <span className="inline font-medium">Pesquisar na web</span>
              {enableSearch && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#a8c7fa] animate-pulse ml-0.5" />
              )}
            </button>

            {/* Thinking mode toggle chip */}
            <button
              id="thinking-toggle-btn"
              type="button"
              onClick={onToggleThinking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                thinking
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-xs'
                  : 'bg-white/5 text-neutral-300 hover:text-white border border-white/10 hover:border-white/20'
              }`}
              title="Ativar raciocínio detalhado passo a passo"
            >
              <Brain size={14} className={thinking ? 'text-purple-300' : 'text-neutral-400'} />
              <span className="inline font-medium">Raciocínio</span>
              {thinking && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          {/* Right tools: Voice microphone & Send button */}
          <div className="flex items-center gap-1.5">
            {/* Mic button */}
            <button
              id="mic-btn"
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-full transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'hover:bg-white/10 text-neutral-300 hover:text-white'
              }`}
              title={isListening ? 'Parar gravação' : 'Usar microfone'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Send button */}
            <button
              id="send-prompt-btn"
              type="button"
              disabled={!hasContent || isLoading}
              onClick={onSend}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                hasContent && !isLoading
                  ? 'bg-white text-black hover:bg-neutral-200 shadow-md cursor-pointer'
                  : 'bg-white/10 text-neutral-500 cursor-not-allowed'
              }`}
              title="Enviar mensagem"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Signature Gemini Disclaimer */}
      <div className="text-center mt-2.5 text-[11px] text-neutral-400 leading-tight">
        O Gemini pode apresentar informações imprecisas, inclusive sobre pessoas.
        Por isso, cheque as respostas.{' '}
        <span className="underline cursor-pointer hover:text-neutral-300">
          Sua privacidade e o Gemini Apps
        </span>
      </div>
    </div>
  );
});

PromptInput.displayName = 'PromptInput';
