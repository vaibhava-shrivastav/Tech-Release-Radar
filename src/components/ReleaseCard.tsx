import React from 'react';
import { EnrichedRelease } from '../lib/types';
import { AlertTriangle, ShieldAlert, CheckCircle, Search, ExternalLink, GitMerge, FileText } from 'lucide-react';

export default function ReleaseCard({ release }: { release: EnrichedRelease }) {
  const { analysis } = release;

  const renderVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'Update now':
        return (
          <span className="verdict-badge verdict-update-now">
            <ShieldAlert size={14} /> Update Now
          </span>
        );
      case 'Test first':
        return (
          <span className="verdict-badge verdict-test-first">
            <AlertTriangle size={14} /> Test First
          </span>
        );
      case 'No action needed':
        return (
          <span className="verdict-badge verdict-no-action">
            <CheckCircle size={14} /> No Action Needed
          </span>
        );
      case 'Investigate':
        return (
          <span className="verdict-badge verdict-investigate">
            <Search size={14} /> Investigate
          </span>
        );
      default:
        return null;
    }
  };

  const getActionIcon = (actionText: string) => {
    if (actionText.toLowerCase().includes('patch') || actionText.toLowerCase().includes('upgrade')) return <GitMerge size={16} />;
    if (actionText.toLowerCase().includes('test')) return <AlertTriangle size={16} />;
    return <FileText size={16} />;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="glass-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <span className="badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {release.technology} • {release.source.split(':')[0]}
          </span>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{release.title}</h3>
        </div>
        {analysis?.verdict && renderVerdictBadge(analysis.verdict)}
      </div>

      <p className="markdown-body" style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
        {release.summary}
      </p>

      {analysis && (
        <div className="project-impact">
          <h4>Why it matters:</h4>
          <p style={{ marginBottom: '1rem' }}>{analysis.reasoning}</p>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0.25rem 0' }}>Affected projects:</span>
            {analysis.affectedProjects.map(p => (
              <span key={p} className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {p}
              </span>
            ))}
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.875rem' }}>
            <strong style={{ color: 'var(--foreground)' }}>Recommended Action:</strong>{' '}
            <span style={{ color: '#e2e8f0' }}>{analysis.recommendedAction}</span>
          </div>
        </div>
      )}

      <div className="actions-row">
        <a href={release.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <ExternalLink size={16} /> Source
        </a>
        {analysis?.verdict === 'Update now' || analysis?.verdict === 'Test first' ? (
          <button className="btn btn-secondary">
            {getActionIcon(analysis.recommendedAction)} Prepare Patch
          </button>
        ) : null}
      </div>

      <div className="release-meta" style={{ marginTop: '1.5rem' }}>
        <span>Published {timeAgo(release.publishedAt)}</span>
        {release.isSecurity && <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={14}/> Security</span>}
        {release.isBreaking && <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14}/> Breaking</span>}
      </div>
    </div>
  );
}
