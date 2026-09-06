/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Attachment, ChatSession, Message, ModelId, UserProfile } from './types';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessages } from './components/ChatMessages';
import { PromptInput } from './components/PromptInput';
import { SettingsModal } from './components/SettingsModal';
import { GeminiAdvancedModal } from './components/GeminiAdvancedModal';
import { HelpModal } from './components/HelpModal';
import { LoginModal } from './components/LoginModal';

const STORAGE_KEY = 'gemini_app_sessions_v1';
const THEME_KEY = 'gemini_app_theme';
const USER_STORAGE_KEY = 'astra_user_profile_v1';

function cleanErrorMessage(raw: string): string {
  if (!raw) return 'Oscilação temporária de conexão. Clique em "Tentar novamente" abaixo para reconectar.';

  const str = typeof raw === 'string' ? raw : JSON.stringify(raw);

  if (
    str.includes('503') ||
    str.includes('UNAVAILABLE') ||
    str.includes('high demand') ||
    str.includes('Spikes in demand') ||
    str.includes('Resource has been exhausted') ||
    str.includes('RESOURCE_EXHAUSTED') ||
    str.includes('429') ||
    str.includes('oscilação') ||
    str.includes('oscilacao') ||
    str.includes('alta demanda')
  ) {
    return 'Os servidores estavam com alta demanda temporária. A rota de contingência foi ativada — clique em "Tentar novamente" para receber a resposta imediatamente.';
  }

  if (str.includes('API_KEY')) {
    return 'A chave de API da Astra não foi encontrada ou é inválida.';
  }

  // If the error message contains internal backend trace lines or JSON dump
  if (str.startsWith('{') || str.includes('Backend Error') || str.includes('[Gemini Server]')) {
    return 'Instabilidade temporária nos servidores. Por favor, clique em tentar novamente.';
  }

  return str;
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

  // User Profile Authentication state - cada usuário entra com a sua própria conta
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [loginOpen, setLoginOpen] = useState(false);

  const handleLogin = useCallback((profile: UserProfile) => {
    setCurrentUser(profile);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
    setLoginOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {}
    setLoginOpen(false);
  }, []);

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
  const handleSendMessage = async (
    textToSend?: string,
    attachmentsToSend?: Attachment[],
    explicitHistory?: Message[]
  ) => {
    const activeAttachments =
      attachmentsToSend !== undefined ? attachmentsToSend : attachments;
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent && activeAttachments.length === 0) return;
    if (isStreaming) return;

    const userMessageId = Math.random().toString(36).substring(7);
    const geminiMessageId = Math.random().toString(36).substring(7);

    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      attachments: activeAttachments.length > 0 ? [...activeAttachments] : undefined,
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
        prev.map((s) => {
          if (s.id !== activeId) return s;
          const baseMsgs = explicitHistory !== undefined ? explicitHistory : s.messages;
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...baseMsgs, newUserMessage, initialGeminiMessage],
          };
        })
      );
    }

    // Reset input fields
    setInput('');
    setAttachments([]);
    setIsStreaming(true);

    try {
      // Prepare payload with sanitized conversation history
      const historySession = sessions.find((s) => s.id === activeId);
      const rawExistingMsgs =
        explicitHistory !== undefined
          ? explicitHistory
          : historySession
          ? historySession.messages
          : [];

      // Filter out any messages with errors or empty placeholder content
      const cleanHistory = rawExistingMsgs.filter(
        (m) =>
          !m.error &&
          (Boolean(m.content?.trim()) ||
            (Array.isArray(m.attachments) && m.attachments.length > 0))
      );

      const fullHistory = [...cleanHistory, newUserMessage];

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
                            'Falha na conexão com a Astra. Por favor, tente novamente.'
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

    // Slice history strictly prior to the last user message to avoid duplicate or dangling errors
    const lastUserIndex = currentMessages.lastIndexOf(lastUserMessage);
    const historyBeforeRetry = currentMessages.slice(0, lastUserIndex);

    // Trigger clean re-send with explicit prior history and attachments
    handleSendMessage(
      lastUserMessage.content,
      lastUserMessage.attachments,
      historyBeforeRetry
    );
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
      {/* Astra Sidebar */}
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
        currentUser={currentUser}
        onOpenLogin={() => setLoginOpen(true)}
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
          currentUser={currentUser}
          onOpenLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
        />

        {/* Conversation Area or Welcome Screen */}
        <main className="flex-1 flex flex-col min-h-0 relative">
          {/* Scrollable conversation / welcome body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col justify-start">
            {currentMessages.length === 0 ? (
              <WelcomeScreen
                userName={currentUser?.name ? currentUser.name.split(' ')[0] : 'Visitante'}
                onSelectPrompt={(prompt) => {
                  setInput(prompt);
                  handleSendMessage(prompt);
                }}
              />
            ) : (
              <ChatMessages
                messages={currentMessages}
                userEmail={currentUser?.email || currentUser?.name || 'Você'}
                isStreaming={isStreaming}
                onRegenerate={handleRegenerate}
                onEditPrompt={handleEditPrompt}
              />
            )}
          </div>

          {/* Floating Prompt Input Bar - ALWAYS PINNED & VISIBLE AT THE BOTTOM */}
          <div className="shrink-0 z-20 pb-2">
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
          </div>
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
        canDismiss={!!currentUser}
      />

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
