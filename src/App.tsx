/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Attachment, ChatSession, Message, ModelId } from './types';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessages } from './components/ChatMessages';
import { PromptInput } from './components/PromptInput';
import { SettingsModal } from './components/SettingsModal';
import { GeminiAdvancedModal } from './components/GeminiAdvancedModal';
import { HelpModal } from './components/HelpModal';

const STORAGE_KEY = 'gemini_app_sessions_v1';
const THEME_KEY = 'gemini_app_theme';

function cleanErrorMessage(raw: string): string {
  if (!raw) return 'Falha na conexão com o Gemini. Por favor, tente novamente.';
  if (
    raw.includes('503') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('high demand') ||
    raw.includes('Resource has been exhausted') ||
    raw.includes('RESOURCE_EXHAUSTED')
  ) {
    return 'Os servidores do modelo estão com alta demanda temporária. Clique em "Tentar novamente" para continuar.';
  }
  if (raw.includes('API_KEY')) {
    return 'A chave de API do Gemini não foi encontrada ou é inválida.';
  }
  return raw;
}

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-3.8-flash');

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [enableSearch, setEnableSearch] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved !== 'light';
    } catch {
      return true;
    }
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Debounced save sessions to localStorage (avoids blocking main thread on every character during streaming)
  useEffect(() => {
    if (isStreaming) return; // Do not block UI thread during active streaming

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save sessions to localStorage:', e);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [sessions, isStreaming]);

  // Flush save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessions]);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    } catch {}

    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Current session getter
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  // Create or switch to new chat
  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setInput('');
    setAttachments([]);
  }, []);

  // Delete a session
  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
    },
    [currentSessionId]
  );

  // Rename a session
  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  }, []);

  // Toggle pin on session
  const handleTogglePinSession = useCallback((id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  }, []);

  // Clear all chats
  const handleClearAllChats = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Send message flow
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent && attachments.length === 0) return;
    if (isStreaming) return;

    const userMessageId = Math.random().toString(36).substring(7);
    const geminiMessageId = Math.random().toString(36).substring(7);

    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const initialGeminiMessage: Message = {
      id: geminiMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      modelUsed: selectedModel,
    };

    let activeId = currentSessionId;

    if (!activeId) {
      // Create new session
      const title =
        messageContent.length > 32
          ? messageContent.substring(0, 32) + '...'
          : messageContent || 'Nova conversa';

      const newSession: ChatSession = {
        id: Math.random().toString(36).substring(7),
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [newUserMessage, initialGeminiMessage],
      };

      activeId = newSession.id;
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(activeId);
    } else {
      // Append to current session
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...s.messages, newUserMessage, initialGeminiMessage],
              }
            : s
        )
      );
    }

    // Reset input fields
    setInput('');
    setAttachments([]);
    setIsStreaming(true);

    try {
      // Prepare payload with conversation history
      const historySession = sessions.find((s) => s.id === activeId);
      const existingMsgs = historySession ? historySession.messages : [];
      const fullHistory = [...existingMsgs, newUserMessage];

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: fullHistory.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          model: selectedModel,
          enableSearch,
          thinking,
        }),
      });

      if (!response.ok) {
        throw new Error(`Servidor retornou erro: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Nenhuma resposta recebida do servidor.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';
      let rafId: number | null = null;
      let lastRenderedText = '';

      // Throttles React state updates to 60fps display refresh rate
      const scheduleRafUpdate = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          if (lastRenderedText === accumulatedText) return;
          lastRenderedText = accumulatedText;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === geminiMessageId
                        ? {
                            ...m,
                            content: accumulatedText,
                          }
                        : m
                    ),
                  }
                : s
            )
          );
        });
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));

                if (data.error) {
                  if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                  }
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === activeId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === geminiMessageId
                                ? {
                                    ...m,
                                    isStreaming: false,
                                    error: cleanErrorMessage(data.error),
                                  }
                                : m
                            ),
                          }
                        : s
                    )
                  );
                  setIsStreaming(false);
                  return;
                }

                if (data.text) {
                  accumulatedText += data.text;
                  scheduleRafUpdate();
                }

                if (data.done) {
                  if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                  }
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === activeId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === geminiMessageId
                                ? {
                                    ...m,
                                    content: accumulatedText,
                                    isStreaming: false,
                                    sources: data.sources,
                                  }
                                : m
                            ),
                          }
                        : s
                    )
                  );
                  setIsStreaming(false);
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }
      } finally {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    } catch (err: any) {
      console.error('Error during streaming:', err);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === geminiMessageId
                    ? {
                        ...m,
                        isStreaming: false,
                        error: cleanErrorMessage(
                          err?.message ||
                            'Falha na conexão com o Gemini. Por favor, tente novamente.'
                        ),
                      }
                    : m
                ),
              }
            : s
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (!currentSession || currentMessages.length === 0 || isStreaming) return;

    // Find the last user message
    const lastUserMessage = [...currentMessages]
      .reverse()
      .find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove the last model message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.filter(
                (m, idx) => !(idx === s.messages.length - 1 && m.role === 'model')
              ),
            }
          : s
      )
    );

    // Trigger re-send
    handleSendMessage(lastUserMessage.content);
  };

  // Handle edit prompt
  const handleEditPrompt = (text: string) => {
    setInput(text);
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#f0f4f9] text-[#1f1f1f]'
      }`}
    >
      {/* Google Gemini Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopBar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          selectedModel={selectedModel}
          onSelectModel={(model) => setSelectedModel(model)}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenAdvancedModal={() => setAdvancedOpen(true)}
          userEmail="ruanlucccas75@gmail.com"
        />

        {/* Conversation Area or Welcome Screen */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {currentMessages.length === 0 ? (
            <WelcomeScreen
              userName="Ruan"
              onSelectPrompt={(prompt) => {
                setInput(prompt);
                handleSendMessage(prompt);
              }}
            />
          ) : (
            <ChatMessages
              messages={currentMessages}
              userEmail="ruanlucccas75@gmail.com"
              isStreaming={isStreaming}
              onRegenerate={handleRegenerate}
              onEditPrompt={handleEditPrompt}
            />
          )}

          {/* Floating Prompt Input Bar */}
          <PromptInput
            input={input}
            setInput={setInput}
            onSend={() => handleSendMessage()}
            isLoading={isStreaming}
            enableSearch={enableSearch}
            onToggleSearch={() => setEnableSearch((prev) => !prev)}
            thinking={thinking}
            onToggleThinking={() => setThinking((prev) => !prev)}
            attachments={attachments}
            onAddAttachment={(att) => setAttachments((prev) => [...prev, att])}
            onRemoveAttachment={(id) =>
              setAttachments((prev) => prev.filter((a) => a.id !== id))
            }
          />
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onClearAllChats={handleClearAllChats}
      />

      <GeminiAdvancedModal
        isOpen={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        onSelectProModel={() => setSelectedModel('gemini-3.1-pro-preview')}
      />

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
