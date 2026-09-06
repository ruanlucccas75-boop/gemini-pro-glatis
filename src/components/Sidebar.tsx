import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle,
  Clock,
  Pin,
  MoreVertical,
  Trash2,
  Edit2,
  Moon,
  Sun,
  Search,
  X,
  User,
  LogIn,
} from 'lucide-react';
import { ChatSession, UserProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  isUpdateAvailable?: boolean;
  onOpenUpdateModal?: () => void;
  installedVersion?: string;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  isOpen,
  onCloseMobile,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenHelp,
  currentUser,
  onOpenLogin,
  isUpdateAvailable,
  onOpenUpdateModal,
  installedVersion,
}) => {
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleInput(session.title);
    setActiveMenuSessionId(null);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitleInput.trim()) {
      onRenameSession(id, editTitleInput.trim());
    }
    setEditingSessionId(null);
  };

  // Filter sessions by search query in title
  const query = searchQuery.trim().toLowerCase();
  const filteredSessions = query
    ? sessions.filter((s) => s.title.toLowerCase().includes(query))
    : sessions;

  // Group chats by Pinned and Recent
  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const regularSessions = filteredSessions.filter((s) => !s.isPinned);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#1e1f20] border-r border-white/5 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72 translate-x-0' : '-translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden'
        }`}
      >
        {/* Top Header: Astra Brand, New Chat button & Search bar */}
        <div className="p-3 pt-4 space-y-3">
          {/* Astra App Header */}
          <div className="flex items-center gap-2.5 px-2 pb-1">
            <img
              src="/astra-logo.jpg"
              alt="Astra Logo"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-400/40 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                Astra
              </span>
              <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-medium">
                Artificial Intelligence
              </span>
            </div>
          </div>

          <button
            id="new-chat-btn"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full bg-[#131314] hover:bg-[#282a2c] text-neutral-200 hover:text-white border border-white/10 transition-all shadow-sm group cursor-pointer"
          >
            <Plus size={18} className="text-[#a8c7fa] group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Nova conversa</span>
          </button>

          {/* Search bar for filtering chats by title */}
          {sessions.length > 0 && (
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                id="sidebar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar conversas..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#131314]/80 hover:bg-[#131314] focus:bg-[#131314] text-neutral-200 placeholder-neutral-500 rounded-xl border border-white/5 focus:border-[#a8c7fa]/40 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="clear-sidebar-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Limpar pesquisa"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sessions list (Recentes) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {/* Empty search state */}
          {query && filteredSessions.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 text-neutral-400">
                <Search size={14} />
              </div>
              <p className="text-xs text-neutral-300 font-medium">Nenhuma conversa encontrada</p>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px] mx-auto truncate">
                Nenhum título coincide com "{searchQuery}"
              </p>
              <button
                type="button"
                id="empty-clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-[#a8c7fa] hover:underline cursor-pointer"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <>
              {/* Pinned sessions */}
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Pin size={11} className="text-[#a8c7fa]" />
                      Fixadas
                    </span>
                    {query && (
                      <span className="text-[10px] text-neutral-500 font-normal">
                        {pinnedSessions.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {pinnedSessions.map((session) => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isSelected={session.id === currentSessionId}
                        isEditing={editingSessionId === session.id}
                        editTitleInput={editTitleInput}
                        setEditTitleInput={setEditTitleInput}
                        onSelectSession={() => {
                          onSelectSession(session.id);
                          onCloseMobile();
                        }}
                        onSaveRename={(e) => handleSaveRename(session.id, e)}
                        onStartRename={(e) => handleStartRename(session, e)}
                        onDelete={() => onDeleteSession(session.id)}
                        onTogglePin={() => onTogglePinSession(session.id)}
                        menuOpen={activeMenuSessionId === session.id}
                        onToggleMenu={(e) => {
                          e.stopPropagation();
                          setActiveMenuSessionId(
                            activeMenuSessionId === session.id ? null : session.id
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular recent sessions */}
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} />
                    {query ? 'Resultados' : 'Recentes'}
                  </span>
                  {query && (
                    <span className="text-[10px] text-neutral-500 font-normal">
                      {regularSessions.length}
                    </span>
                  )}
                </div>
                {regularSessions.length === 0 && pinnedSessions.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-neutral-500 text-center">
                    Suas conversas recentes com a Astra aparecerão aqui.
                  </div>
                ) : (
                  <div className="space-y-0.5 mt-1">
                    {regularSessions.map((session) => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isSelected={session.id === currentSessionId}
                        isEditing={editingSessionId === session.id}
                        editTitleInput={editTitleInput}
                        setEditTitleInput={setEditTitleInput}
                        onSelectSession={() => {
                          onSelectSession(session.id);
                          onCloseMobile();
                        }}
                        onSaveRename={(e) => handleSaveRename(session.id, e)}
                        onStartRename={(e) => handleStartRename(session, e)}
                        onDelete={() => onDeleteSession(session.id)}
                        onTogglePin={() => onTogglePinSession(session.id)}
                        menuOpen={activeMenuSessionId === session.id}
                        onToggleMenu={(e) => {
                          e.stopPropagation();
                          setActiveMenuSessionId(
                            activeMenuSessionId === session.id ? null : session.id
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom actions & settings */}
        <div className="p-3 border-t border-white/5 space-y-1">
          {/* User profile quick access */}
          {currentUser ? (
            <button
              id="sidebar-user-btn"
              onClick={onOpenLogin}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors text-left group"
              title="Clique para trocar ou gerenciar sua conta"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-[11px] leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-neutral-400 truncate leading-tight">
                  {currentUser.email}
                </p>
              </div>
            </button>
          ) : (
            <button
              id="sidebar-login-btn"
              onClick={onOpenLogin}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-cyan-300 hover:bg-cyan-500/10 transition-colors font-medium"
            >
              <LogIn size={16} />
              <span>Entrar na sua conta</span>
            </button>
          )}

          {onOpenUpdateModal && (
            <button
              id="sidebar-updates-btn"
              onClick={() => {
                onOpenUpdateModal();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={16} className={isUpdateAvailable ? "text-cyan-400" : "text-neutral-400"} />
                <span>Atualizações</span>
              </div>
              {isUpdateAvailable ? (
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30 animate-pulse">
                  Nova v2.5.0
                </span>
              ) : (
                <span className="text-[10px] text-neutral-500 font-mono">
                  {installedVersion || 'v2.4.2'}
                </span>
              )}
            </button>
          )}

          <button
            id="settings-modal-btn"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings size={16} />
            <span>Configurações</span>
          </button>

          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Tema Claro' : 'Tema Escuro'}</span>
          </button>

          <button
            id="help-sidebar-btn"
            onClick={onOpenHelp}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <HelpCircle size={16} />
            <span>Ajuda e suporte</span>
          </button>

          {/* Location badge typical of Google apps */}
          <div className="pt-2 px-3 flex items-center gap-2 text-[11px] text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
            <span>Brasil • Baseado na sua localização</span>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

const SessionItem: React.FC<{
  session: ChatSession;
  isSelected: boolean;
  isEditing: boolean;
  editTitleInput: string;
  setEditTitleInput: (val: string) => void;
  onSelectSession: () => void;
  onSaveRename: (e: React.FormEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onTogglePin: () => void;
  menuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
}> = React.memo(({
  session,
  isSelected,
  isEditing,
  editTitleInput,
  setEditTitleInput,
  onSelectSession,
  onSaveRename,
  onStartRename,
  onDelete,
  onTogglePin,
  menuOpen,
  onToggleMenu,
}) => {
  return (
    <div className="relative group">
      {isEditing ? (
        <form onSubmit={onSaveRename} className="p-1">
          <input
            type="text"
            value={editTitleInput}
            onChange={(e) => setEditTitleInput(e.target.value)}
            onBlur={onSaveRename}
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#282a2c] text-white text-xs border border-[#4e82ee] focus:outline-none"
          />
        </form>
      ) : (
        <div
          onClick={onSelectSession}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-[#282a2c] text-white font-medium'
              : 'text-neutral-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <MessageSquare size={15} className="shrink-0 text-neutral-400" />
            <span className="truncate">{session.title}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              id={`session-menu-btn-${session.id}`}
              onClick={onToggleMenu}
              className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white"
              title="Mais opções"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Dropdown menu for session actions */}
      {menuOpen && (
        <div className="absolute right-2 top-8 w-44 rounded-xl bg-[#282a2c] border border-white/10 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-neutral-200 hover:bg-white/10"
          >
            <Pin size={14} className={session.isPinned ? 'text-[#a8c7fa]' : ''} />
            <span>{session.isPinned ? 'Desafixar' : 'Fixar no topo'}</span>
          </button>
          <button
            onClick={onStartRename}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-neutral-200 hover:bg-white/10"
          >
            <Edit2 size={14} />
            <span>Renomear</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            <span>Excluir</span>
          </button>
        </div>
      )}
    </div>
  );
});

SessionItem.displayName = 'SessionItem';
