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
} from 'lucide-react';
import { ChatSession } from '../types';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
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
}) => {
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

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

  // Group chats by Pinned and Recent
  const pinnedSessions = sessions.filter((s) => s.isPinned);
  const regularSessions = sessions.filter((s) => !s.isPinned);

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
        {/* Top Header & New Chat button */}
        <div className="p-3 pt-4">
          <button
            id="new-chat-btn"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full bg-[#131314] hover:bg-[#282a2c] text-neutral-200 hover:text-white border border-white/10 transition-all shadow-sm group"
          >
            <Plus size={18} className="text-[#a8c7fa] group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Nova conversa</span>
          </button>
        </div>

        {/* Sessions list (Recentes) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Pinned sessions */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin size={11} className="text-[#a8c7fa]" />
                Fixadas
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
            <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={11} />
              Recentes
            </div>
            {regularSessions.length === 0 && pinnedSessions.length === 0 ? (
              <div className="px-3 py-4 text-xs text-neutral-500 text-center">
                Suas conversas recentes com o Gemini aparecerão aqui.
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
        </div>

        {/* Bottom actions & settings */}
        <div className="p-3 border-t border-white/5 space-y-1">
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
};

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
}> = ({
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
};
