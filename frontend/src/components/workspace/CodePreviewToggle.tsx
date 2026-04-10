interface CodePreviewToggleProps {
  view: 'code' | 'preview';
  onChange: (v: 'code' | 'preview') => void;
}

export const CodePreviewToggle = ({ view, onChange }: CodePreviewToggleProps) => (
  <div className="flex bg-[#111720] p-0.5 rounded-lg border border-[#1e2a3a]">
    <button
      onClick={() => onChange('code')}
      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-['Inter'] rounded-md transition-all ${
        view === 'code'
          ? 'bg-[#1e2a3a] text-[#f1f3fc] shadow-sm'
          : 'text-[#4a5568] hover:text-[#8a98b3]'
      }`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
      Code
    </button>
    <button
      onClick={() => onChange('preview')}
      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-['Inter'] rounded-md transition-all ${
        view === 'preview'
          ? 'bg-[#10b981]/20 text-[#10b981] shadow-sm'
          : 'text-[#4a5568] hover:text-[#8a98b3]'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${view === 'preview' ? 'bg-[#10b981]' : 'bg-[#2d3748]'}`} />
      Preview
    </button>
  </div>
);
