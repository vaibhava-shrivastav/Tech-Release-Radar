import { NextResponse } from 'next/server';
import { EnrichedRelease, ReleaseEvent, ProjectContext } from '@/lib/types';
import { analyzeRelease } from '@/lib/services/analysis';
import { saveRelease, releaseExists } from '@/lib/services/storage';

const mockUserContext: ProjectContext = {
  technologies: ['node.js', 'kubernetes', 'react', 'aws', 'docker', 'terraform'],
  projects: [
    { name: 'frontend-app', technologies: ['node.js', 'react'] },
    { name: 'eks-prod-cluster', technologies: ['kubernetes', 'aws', 'docker'] },
    { name: 'serverless-pipeline', technologies: ['aws', 'node.js', 'terraform'] }
  ]
};

const GITHUB_REPOS = [
  { repo: 'nodejs/node', tech: 'Node.js' },
  { repo: 'kubernetes/kubernetes', tech: 'Kubernetes' },
  { repo: 'moby/moby', tech: 'Docker' },
  { repo: 'hashicorp/terraform', tech: 'Terraform' },
  { repo: 'facebook/react', tech: 'React' },
  { repo: 'vercel/next.js', tech: 'Next.js' },
];

async function fetchLatestGitHubRelease(repoInfo: { repo: string, tech: string }): Promise<ReleaseEvent | null> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Tech-Release-Radar',
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repoInfo.repo}/releases/latest`, { headers, next: { revalidate: 60 } });
    
    if (!res.ok) {
      console.warn(`GitHub API error for ${repoInfo.repo}: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    return {
      id: `github:${repoInfo.repo}:${data.tag_name}`,
      source: `github:${repoInfo.repo}`,
      technology: repoInfo.tech,
      version: data.tag_name,
      title: data.name || data.tag_name,
      publishedAt: data.published_at,
      url: data.html_url,
      summary: (data.body || '').substring(0, 300) + '...',
      isSecurity: (data.body || '').toLowerCase().includes('security') || (data.body || '').toLowerCase().includes('cve-'),
      isBreaking: (data.body || '').toLowerCase().includes('breaking') || (data.body || '').toLowerCase().includes('deprecated'),
    };
  } catch (error) {
    console.error(`Failed to fetch release for ${repoInfo.repo}`, error);
    return null;
  }
}

export async function POST() {
  try {
    const processed: EnrichedRelease[] = [];
    const errors: string[] = [];

    // Process repositories sequentially to avoid aggressive rate-limiting
    for (const repoInfo of GITHUB_REPOS) {
      const releaseEvent = await fetchLatestGitHubRelease(repoInfo);
      
      if (!releaseEvent) {
        errors.push(`Failed to fetch or no releases for ${repoInfo.repo}`);
        continue;
      }

      const exists = await releaseExists(releaseEvent.id);
      
      if (!exists) {
        const analysis = await analyzeRelease(releaseEvent, mockUserContext);
        const enriched: EnrichedRelease = { ...releaseEvent, analysis };
        await saveRelease(enriched);
        processed.push(enriched);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processedCount: processed.length, 
      processed,
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ success: false, error: 'Failed to ingest releases' }, { status: 500 });
  }
}
