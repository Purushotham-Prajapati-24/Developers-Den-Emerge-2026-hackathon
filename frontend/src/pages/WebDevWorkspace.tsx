import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MonacoCollaborative } from '../features/editor/MonacoCollaborative';
import { FileExplorer } from '../features/editor/FileExplorer';
import { WebPreview } from '../features/editor/WebPreview';
import { WebDevAIPanel } from '../features/ai/WebDevAIPanel';
import { CodePreviewToggle } from '../components/workspace/CodePreviewToggle';
import { ChatPanel } from '../features/collaboration/ChatPanel';
import { CollaboratorsPanel } from '../features/collaboration/CollaboratorsPanel';
import { WorkspaceHeader } from '../components/workspace/WorkspaceHeader';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebDevProject {
  _id: string;
  title: string;
  language: string;
  projectType: 'web-development';
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
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d12] border border-[#1e2a3a] text-[#f1f3fc] font-mono text-sm placeholder-[#3a4458] focus:outline-none focus:border-[#10b981]/50 transition-colors"
              placeholder="@developer"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8a98b3] mb-1.5 font-['Inter'] uppercase tracking-wider">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0d12] border border-[#1e2a3a] text-[#f1f3fc] font-['Inter'] text-sm focus:outline-none focus:border-[#10b981]/50 transition-colors"
            >
              <option value="editor">Editor</option>
              <option value="commenter">Commenter</option>
              <option value="reader">Reader</option>
            </select>
          </div>
          {status && (
            <div className={`px-4 py-3 rounded-lg text-sm font-['Inter'] ${
              status.type === 'success'
                ? 'bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981]'
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
              className="flex-1 py-2.5 rounded-lg bg-[#10b981] text-[#022c22] font-['Inter'] font-bold text-sm hover:bg-[#34d399] disabled:opacity-50 transition-all"
            >{loading ? 'Inviting...' : 'Invite →'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ─── Main Component ───────────────────────────────────────────────────────────

interface WebDevWorkspaceProps {
  project: WebDevProject;
  onRefresh: () => void;
}

export const WebDevWorkspace = ({ project, onRefresh }: WebDevWorkspaceProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();

  const [showInvite, setShowInvite] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [chatOpen, setChatOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);

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

  // Center slot: Code/Preview toggle
  const centerSlot = (
    <CodePreviewToggle view={viewMode} onChange={setViewMode} />
  );

  // No AI toggle button — WebDevAIPanel is always visible as fixed column

  return (
    <div className="h-screen bg-[#0a0d12] flex flex-col overflow-hidden">
      {/* Header — green accent for web dev brand */}
      <WorkspaceHeader
        title={project.title}
        collaborators={project.collaborators}
        pendingInvites={pendingInvites}
        onCollabClick={() => { setCollabOpen((o) => !o); if (!collabOpen) setChatOpen(false); }}
        collabOpen={collabOpen}
        onInviteClick={() => setShowInvite(true)}
        onChatClick={() => { setChatOpen((o) => !o); if (!chatOpen) setCollabOpen(false); }}
        chatOpen={chatOpen}
        centerSlot={centerSlot}
        showDeploy={true}
      />

      {/* ── Main layout: explorer | editor/preview | AI panel | optional right panels ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* File Explorer */}
        <div className={`flex-shrink-0 transition-all duration-300 flex ${explorerOpen ? 'w-56' : 'w-12'} bg-[#0d1117] border-r border-[#1e2a3a] overflow-hidden`}>
          <FileExplorer isOpen={explorerOpen} onToggle={() => setExplorerOpen(!explorerOpen)} />
        </div>

        {/* Editor / Preview area — NOT the full flex-1, leaves room for always-visible AI panel */}
        <div className="flex flex-col flex-1 overflow-hidden border-r border-[#1e2a3a]">
          <div className="flex-1 overflow-hidden relative">
            {/* Monaco editor — hidden (not unmounted) during preview so Yjs binding stays alive */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${viewMode !== 'code' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <MonacoCollaborative
                projectId={projectId!}
                language="html"
                role={myRole}
                projectType="web-development"
              />
            </div>

            {/* WebPreview iframe — only rendered when in preview mode */}
            <div className={`absolute inset-0 p-2 transition-opacity duration-200 ${viewMode !== 'preview' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <WebPreview isActive={viewMode === 'preview'} />
            </div>
          </div>
          {/* NO ExecutionTerminal here — web dev only needs the browser preview */}
        </div>

        {/* ── Web Dev AI Panel — ALWAYS VISIBLE fixed right column ── */}
        <div className="w-72 flex-shrink-0 border-r border-[#1e2a3a] overflow-hidden">
          <WebDevAIPanel />
        </div>

        {/* Collapsible panels: chat + collaborators */}
        <div className={`flex transition-all duration-300 overflow-hidden ${chatOpen || collabOpen ? 'w-72' : 'w-0'}`}>
          {chatOpen && (
            <div className="w-72 flex-shrink-0 h-full">
              <ChatPanel />
            </div>
          )}
          {collabOpen && (
            <div className="w-72 flex-shrink-0 h-full">
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
