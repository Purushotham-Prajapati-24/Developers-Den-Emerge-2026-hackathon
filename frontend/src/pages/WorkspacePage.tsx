import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProgrammingWorkspace, type ProgrammingProject } from './ProgrammingWorkspace';
import { WebDevWorkspace, type WebDevProject } from './WebDevWorkspace';
import api from '../services/api';

type AnyProject = ProgrammingProject | WebDevProject;

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const WorkspaceLoader = () => (
  <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center">
    <div className="flex items-center gap-3 text-[#8a98b3] font-['Inter'] text-sm">
      <span className="w-5 h-5 border-2 border-[#3a4458] border-t-[#10b981] rounded-full animate-spin" />
      Loading workspace...
    </div>
  </div>
);

/**
 * WorkspacePage — pure dispatcher.
 *
 * Fetches the project once, then renders:
 *   - ProgrammingWorkspace  →  for projectType === 'programming'
 *   - WebDevWorkspace        →  for projectType === 'web-development'
 *
 * NO feature logic lives here. All UI, state, and interactions belong
 * in the specific workspace component.
 */
export default function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<AnyProject | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data.project);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (loading) return <WorkspaceLoader />;
  if (!project) return null;

  if (project.projectType === 'web-development') {
    return (
      <WebDevWorkspace
        project={project as WebDevProject}
        onRefresh={fetchProject}
      />
    );
  }

  return (
    <ProgrammingWorkspace
      project={project as ProgrammingProject}
      onRefresh={fetchProject}
    />
  );
}
