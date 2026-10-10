import { describe, it, expect } from 'vitest';
import { analyzeWithRules, analyzeRelease } from '../src/lib/services/analysis';
import { ReleaseEvent, ProjectContext } from '../src/lib/types';

describe('Rules-based Analysis Engine', () => {
  const mockContext: ProjectContext = {
    technologies: ['node.js', 'react'],
    projects: [
      { name: 'frontend', technologies: ['react', 'node.js'] },
      { name: 'backend', technologies: ['node.js'] }
    ]
  };

  it('should return No action needed for unused technologies', () => {
    const release: ReleaseEvent = {
      id: 'rust-1',
      source: 'github:rust-lang/rust',
      technology: 'Rust',
      version: '1.70.0',
      title: 'Rust 1.70.0',
      publishedAt: new Date().toISOString(),
      url: 'http://example.com',
      summary: 'New rust release',
      isSecurity: false,
      isBreaking: false
    };

    const result = analyzeWithRules(release, mockContext);
    expect(result.verdict).toBe('No action needed');
    expect(result.affectedProjects).toHaveLength(0);
  });

  it('should return Update now for security vulnerabilities', () => {
    const release: ReleaseEvent = {
      id: 'node-sec',
      source: 'github:nodejs/node',
      technology: 'Node.js',
      version: 'v20.0.1',
      title: 'Security Release',
      publishedAt: new Date().toISOString(),
      url: 'http://example.com',
      summary: 'Security fix',
      isSecurity: true,
      isBreaking: false
    };

    const result = analyzeWithRules(release, mockContext);
    expect(result.verdict).toBe('Update now');
    expect(result.affectedProjects).toContain('frontend');
    expect(result.affectedProjects).toContain('backend');
  });

  it('should return Test first for breaking changes', () => {
    const release: ReleaseEvent = {
      id: 'react-break',
      source: 'github:facebook/react',
      technology: 'React',
      version: 'v19.0.0',
      title: 'React 19',
      publishedAt: new Date().toISOString(),
      url: 'http://example.com',
      summary: 'Breaking change release',
      isSecurity: false,
      isBreaking: true
    };

    const result = analyzeWithRules(release, mockContext);
    expect(result.verdict).toBe('Test first');
    expect(result.affectedProjects).toContain('frontend');
    expect(result.affectedProjects).not.toContain('backend');
  });
  
  it('should fall back to rules when Bedrock is disabled (analyzeRelease wrapper)', async () => {
    // Explicitly disable Bedrock
    process.env.BEDROCK_ENABLED = 'false';
    const release: ReleaseEvent = {
      id: 'node-minor',
      source: 'github:nodejs/node',
      technology: 'Node.js',
      version: 'v20.1.0',
      title: 'Minor Release',
      publishedAt: new Date().toISOString(),
      url: 'http://example.com',
      summary: 'Minor fix',
      isSecurity: false,
      isBreaking: false
    };
    
    const result = await analyzeRelease(release, mockContext);
    expect(result.verdict).toBe('Investigate');
  });
});
