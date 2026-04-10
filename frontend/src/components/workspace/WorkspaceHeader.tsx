import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { DeployButton } from './DeployButton';
import { useParams } from 'react-router-dom';

interface Collaborator {
  user: { _id: string; username: string; avatar: string };
  role: string;
}

interface PendingInvite {
  user: { _id: string; username: string; avatar: string };
  role: string;
  sentAt: string;
}

interface Owner {
  name: string;
  username: string;
  avatar: string;
}

interface WorkspaceHeaderProps {
  /** Project title shown in the header */
  title: string;
  /** Collaborator list for the avatar strip */
  collaborators: Collaborator[];
  /** Pending invitations (shown as faded avatars) */
  pendingInvites?: PendingInvite[];
  /** Called when the user clicks the collaborator strip */
  onCollabClick: () => void;
  /** Whether collaborator panel is open (controls highlight) */
  collabOpen: boolean;
  /** Called when "Invite" is clicked */
  onInviteClick: () => void;
  /** Called when chat toggle is clicked */
  onChatClick: () => void;
  /** Whether chat panel is open */
  chatOpen: boolean;
  /** Extra controls injected between title and collab strip (e.g. Code/Preview toggle) */
  centerSlot?: React.ReactNode;
  /** Extra controls injected to right of chat button (e.g. AI toggle) */
  rightSlot?: React.ReactNode;
  /** Whether to show the Vercel Deploy button */
  showDeploy?: boolean;
}

/**
 * Shared workspace header.
 * Both ProgrammingWorkspace and WebDevWorkspace use this to avoid duplicating header chrome.
 */
export const WorkspaceHeader = ({
  title,
  collaborators,
  pendingInvites = [],
  onCollabClick,
  collabOpen,
  onInviteClick,
  onChatClick,
  chatOpen,
  centerSlot,
  rightSlot,
  showDeploy,
}: WorkspaceHeaderProps) => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e2a3a] flex-shrink-0 bg-[#0a0d12]">
      {/* ── Left: back + project name + center slot ─────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/projects')}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8a98b3] hover:text-[#f1f3fc] hover:bg-[#1e2a3a] transition-all text-sm"
          title="Back to projects"
        >
          ←
        </button>
        <div className="w-px h-4 bg-[#1e2a3a]" />
        <h1 className="font-['Space_Grotesk'] font-semibold text-sm text-[#f1f3fc]">
          {title}
        </h1>
        {centerSlot && <div className="ml-2">{centerSlot}</div>}
      </div>

      {/* ── Right: collab avatars + invite + notifications + right slot ─ */}
      <div className="flex items-center gap-3">
        {/* Collaborator avatar strip */}
        <button
          onClick={onCollabClick}
          className={`flex items-center -space-x-1.5 p-1 rounded-xl transition-all hover:bg-[#1e2a3a] ${
            collabOpen ? 'bg-[#e2f0e0]/10 ring-1 ring-[#10b981]/30' : ''
          }`}
        >
          {collaborators.slice(0, 5).map((c, i) =>
            c.user.avatar ? (
              <img
                key={i}
                src={c.user.avatar}
                alt={c.user.username}
                title={c.user.username}
                className="w-6 h-6 rounded-full border-2 border-[#0a0d12] object-cover"
              />
            ) : (
              <div
                key={i}
                title={c.user.username}
                className="w-6 h-6 rounded-full border-2 border-[#0a0d12] bg-[#1e2a3a] flex items-center justify-center text-[9px] text-[#8a98b3] font-['Inter']"
              >
                {c.user.username?.[0]?.toUpperCase()}
              </div>
            )
          )}

          {/* Pending invitations */}
          {pendingInvites.map((invite, i) => (
            <div
              key={`pending-${i}`}
              className="relative opacity-40 hover:opacity-100 transition-opacity cursor-help"
              title={`Invitation sent to @${invite.user.username} (Pending)`}
            >
              {invite.user.avatar ? (
                <img
                  src={invite.user.avatar}
                  alt={invite.user.username}
                  className="w-6 h-6 rounded-full border-2 border-dashed border-[#10b981]/50 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#10b981]/50 bg-[#1e2a3a] flex items-center justify-center text-[9px] text-[#8a98b3] font-['Inter']">
                  {invite.user.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#10b981] rounded-full border border-[#0a0d12]" />
            </div>
          ))}
        </button>

        <NotificationBell />
        <div className="w-px h-4 bg-[#1e2a3a]" />

        <button
          onClick={onInviteClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[#1e2a3a] text-[#8a98b3] font-['Inter'] hover:border-[#10b981]/40 hover:text-[#10b981] transition-all"
        >
          + Invite
        </button>
        
        {showDeploy && projectId && (
          <DeployButton projectId={projectId} />
        )}

        <button
          onClick={onChatClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Inter'] transition-all ${
            chatOpen
              ? 'bg-[#1e2a3a] text-[#f1f3fc] border border-[#2d3a4a]'
              : 'bg-[#111720] text-[#8a98b3] border border-transparent hover:border-[#1e2a3a]'
          }`}
        >
          💬 Team Chat
        </button>

        {rightSlot}
      </div>
    </header>
  );
};
