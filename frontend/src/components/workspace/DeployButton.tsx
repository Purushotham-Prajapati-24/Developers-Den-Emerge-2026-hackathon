import { useState } from 'react';
import api from '../../services/api';
import { useCollaborationStore } from '../../store/useCollaborationStore';

interface DeployButtonProps {
  projectId: string;
}

export const DeployButton = ({ projectId }: DeployButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { files, addAIMessage } = useCollaborationStore();

  const handleDeploy = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Collect all files from the current Yjs document
      // We read the latest text for each file from the global __collabDoc
      const collabDoc = (window as any).__collabDoc;
      if (!collabDoc) {
        throw new Error('Collaboration engine not ready');
      }

      const filePayload = files.map(file => {
        const ytext = collabDoc.getText(file.id);
        return {
          file: file.name,
          data: ytext.toString()
        };
      });

      // 2. Call the backend deployment route
      const { data } = await api.post(`/projects/${projectId}/deploy`, {
        files: filePayload
      });

      // 3. Inject success message with the URL into AI Chat
      addAIMessage(`🚀 **Deployment Successful!**\n\nYour project is now live at:\n[https://${data.url}](https://${data.url})\n\nYou can also monitor the deployment in your [Vercel Dashboard](${data.inspectUrl}).`);

    } catch (error: any) {
      console.error('Deployment failed:', error);
      const msg = error.response?.data?.message || error.message || 'Deployment failed';
      addAIMessage(`❌ **Deployment Failed**\n\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeploy}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Inter'] font-semibold transition-all border ${
        loading 
          ? 'bg-[#1e2a3a] text-[#4a5568] border-transparent cursor-wait' 
          : 'bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/30 hover:bg-[#a78bfa]/20 hover:border-[#a78bfa]/50'
      }`}
    >
      {loading ? (
        <>
          <span className="w-3 h-3 border-2 border-[#4a5568] border-t-[#a78bfa] rounded-full animate-spin" />
          Deploying...
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.73-.78 7.5-3.05 11a22.3 22.3 0 0 1-3.95 3l-3-3z"/><path d="M9 12H4s.5-1 1-4c1.5 0 3 .5 3 .5L9 12z"/><path d="M15 15v4s-1 .5-4 1c0-1.5.5-3 .5-3l3.5-2z"/><line x1="11.5" y1="12.5" x2="15.5" y2="16.5"/>
          </svg>
          Deploy
        </>
      )}
    </button>
  );
};
