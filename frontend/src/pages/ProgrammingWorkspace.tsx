import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MonacoCollaborative } from '../features/editor/MonacoCollaborative';
import { ExecutionTerminal } from '../features/editor/ExecutionTerminal';
import { FileExplorer } from '../features/editor/FileExplorer';
import { AIChatPanel } from '../features/ai/AIChatPanel';
import { ChatPanel } from '../features/collaboration/ChatPanel';
import { CollaboratorsPanel } from '../features/collaboration/CollaboratorsPanel';
import { WorkspaceHeader } from '../components/workspace/WorkspaceHeader';
import { CodePreviewToggle } from '../components/workspace/CodePreviewToggle';
import { WebPreview } from '../features/editor/WebPreview';
import { WebDevAIPanel } from '../features/ai/WebDevAIPanel';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCollaborationStore } from '../store/useCollaborationStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgrammingProject {
  _id: string;
  title: string;
  language: string;
  projectType: 'programming';
  owner: { name: string; username: string; avatar: string };
  collaborators: { user: { _id: string; username: string; avatar: string }; role: string }[];
  pendingInvitations?: { user: { _id: string; username: string; avatar: string }; role: string; sentAt: string }[];
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

const InviteModal = ({ projectId, onClose }: { projectId: string; onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('editor');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post(`/projects/${projectId}/invite`, { username, role });
      setStatus({ type: 'success', msg: `${username} added as ${role}` });
      setUsername('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Invite failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0d12]/80 backdrop-blur-[8px]">
      <div className="bg-[#111720] border border-[#1e2a3a] rounded-2xl p-7 w-full max-w-sm shadow-2xl">
        <h3 className="font-['Space_Grotesk'] font-semibold text-lg text-[#f1f3fc] mb-1">Invite Collaborator</h3>
        <p className="text-sm text-[#8a98b3] font-['Inter'] mb-6">Add someone to this workspace.</p>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs text-[#8a98b3] mb-1.5 font-['Inter'] uppercase tracking-wider">Username</label>
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              required autoFocus
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d12] border border-[#1e2a3a] text-[#f1f3fc] font-mono text-sm placeholder-[#3a4458] focus:outline-none focus:border-[#a78bfa]/50 transition-colors"
              placeholder="@developer"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8a98b3] mb-1.5 font-['Inter'] uppercase tracking-wider">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d12] border border-[#1e2a3a] text-[#f1f3fc] font-['Inter'] text-sm focus:outline-none focus:border-[#a78bfa]/50 transition-colors"
            >
              <option value="editor">Editor</option>
              <option value="commenter">Commenter</option>
              <option value="reader">Reader</option>
            </select>
          </div>
          {status && (
            <div className={`px-4 py-3 rounded-lg text-sm font-['Inter'] ${
              status.type === 'success'
                ? 'bg-emerald-900/20 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-900/20 border border-red-500/20 text-red-400'
            }`}>
              {status.msg}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-[#0a0d12] border border-[#1e2a3a] text-[#8a98b3] font-['Inter'] text-sm hover:text-[#f1f3fc] transition-colors"
            >Close</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-white font-['Inter'] font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
            >{loading ? 'Inviting...' : 'Invite →'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Language Badge ───────────────────────────────────────────────────────────

const LANG_BADGE: Record<string, { label: string; color: string }> = {
  typescript:  { label: 'TS',  color: '#3b82f6' },
  javascript:  { label: 'JS',  color: '#f59e0b' },
  python:      { label: 'PY',  color: '#22c55e' },
  rust:        { label: 'RS',  color: '#f97316' },
  go:          { label: 'GO',  color: '#06b6d4' },
  cpp:         { label: 'C++', color: '#8b5cf6' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProgrammingWorkspaceProps {
  project: ProgrammingProject;
  onRefresh: () => void;
}

export const ProgrammingWorkspace = ({ project, onRefresh }: ProgrammingWorkspaceProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const { files, activeFileId } = useCollaborationStore();

  const [showInvite, setShowInvite] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'chat' | 'weaver'>('chat');
  const [chatOpen, setChatOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

  const activeFile = files.find(f => f.id === activeFileId);
  const isWebFile = activeFile?.name.endsWith('.html') || activeFile?.name.endsWith('.htm');

  const pendingInvites = project.pendingInvitations || [];

  const myId = user?._id || user?.id;
  const isOwner =
    project.owner &&
    ((project.owner as any)._id === myId ||
      (project.owner as any).id === myId ||
      (project.owner as any) === myId);
  const collabEntry = project.collaborators.find(
    (c) => c.user._id === myId || (c.user as any) === myId || (c.user as any).id === myId
  );
  const myRole = isOwner ? 'owner' : collabEntry?.role || 'editor';

  const badge = LANG_BADGE[project.language?.toLowerCase()] || { label: project.language?.toUpperCase() || 'CODE', color: '#8a98b3' };

  // Center slot: language badge + optional preview toggle
  const centerSlot = (
    <div className="flex items-center gap-3">
      <span
        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
        style={{ backgroundColor: `${badge.color}20`, color: badge.color, border: `1px solid ${badge.color}30` }}
      >
        {badge.label}
      </span>
      {isWebFile && (
        <div className="scale-90 origin-left">
          <CodePreviewToggle view={viewMode} onChange={setViewMode} />
        </div>
      )}
    </div>
  );

  // Right slot: AI toggle
  const rightSlot = (
    <button
      onClick={() => { setAiOpen((o) => !o); if (!aiOpen) { setChatOpen(false); setCollabOpen(false); } }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Inter'] transition-all ${
        aiOpen
          ? 'bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30'
          : 'bg-[#111720] text-[#8a98b3] border border-transparent hover:border-[#1e2a3a]'
      }`}
    >
      🤖 AI
    </button>
  );

  return (
    <div className="h-screen bg-[#0a0d12] flex flex-col overflow-hidden">
      <WorkspaceHeader
        title={project.title}
        collaborators={project.collaborators}
        pendingInvites={pendingInvites}
        onCollabClick={() => { setCollabOpen((o) => !o); if (!collabOpen) { setAiOpen(false); setChatOpen(false); } }}
        collabOpen={collabOpen}
        onInviteClick={() => setShowInvite(true)}
        onChatClick={() => { setChatOpen((o) => !o); if (!chatOpen) { setAiOpen(false); setCollabOpen(false); } }}
        chatOpen={chatOpen}
        centerSlot={centerSlot}
        rightSlot={rightSlot}
        showDeploy={isWebFile}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className={`flex-shrink-0 transition-all duration-300 flex ${explorerOpen ? 'w-56' : 'w-12'} bg-[#0d1117] border-r border-[#1e2a3a] overflow-hidden`}>
          <FileExplorer isOpen={explorerOpen} onToggle={() => setExplorerOpen(!explorerOpen)} />
        </div>

        {/* Editor + Terminal */}
        <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${aiOpen || chatOpen || collabOpen ? 'border-r border-[#1e2a3a]' : ''}`}>
          <div className="flex-1 overflow-hidden relative">
            {/* Monaco editor */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${viewMode !== 'code' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <MonacoCollaborative
                projectId={projectId!}
                language={project.language}
                role={myRole}
                projectType="programming"
              />
            </div>

            {/* Web Preview */}
            {isWebFile && (
              <div className={`absolute inset-0 p-2 transition-opacity duration-200 ${viewMode !== 'preview' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <WebPreview isActive={viewMode === 'preview'} />
              </div>
            )}
          </div>
          {/* Execution Terminal — Programming ONLY */}
          {!isWebFile && (
            <div className="h-48 flex-shrink-0 border-t border-[#1e2a3a]">
              <ExecutionTerminal defaultLanguage={project.language} />
            </div>
          )}
        </div>

        {/* Right side panels */}
        <div className={`flex transition-all duration-300 ${aiOpen || chatOpen || collabOpen ? 'w-80' : 'w-0'}`}>
          {aiOpen && (
            <div className="w-80 flex-shrink-0 flex flex-col h-full bg-[#0d1117]">
              {/* AI Panel Header with Switcher */}
              {isWebFile && (
                <div className="flex bg-[#111720] border-b border-[#1e2a3a] p-1 gap-1">
                  <button
                    onClick={() => setAiMode('chat')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                      aiMode === 'chat' ? 'bg-[#1e2a3a] text-[#a78bfa]' : 'text-[#4a5568] hover:text-[#8a98b3]'
                    }`}
                  >
                    Architect Chat
                  </button>
                  <button
                    onClick={() => setAiMode('weaver')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                      aiMode === 'weaver' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-[#4a5568] hover:text-[#8a98b3]'
                    }`}
                  >
                    Web Weaver
                  </button>
                </div>
              )}
              
              <div className="flex-1 overflow-hidden">
                {aiMode === 'weaver' && isWebFile ? (
                  <WebDevAIPanel />
                ) : (
                  <AIChatPanel />
                )}
              </div>
            </div>
          )}
          {chatOpen && (
            <div className="w-80 flex-shrink-0 h-full">
              <ChatPanel />
            </div>
          )}
          {collabOpen && (
            <div className="w-80 flex-shrink-0 h-full">
              <CollaboratorsPanel
                projectId={projectId!}
                owner={project.owner}
                collaborators={project.collaborators}
                pendingInvites={pendingInvites}
                onInviteClick={() => setShowInvite(true)}
                onRefresh={onRefresh}
              />
            </div>
          )}
        </div>
      </div>

      {showInvite && <InviteModal projectId={projectId!} onClose={() => setShowInvite(false)} />}
    </div>
  );
};
