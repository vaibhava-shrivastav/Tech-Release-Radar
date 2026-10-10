export type Verdict = 'Update now' | 'Test first' | 'No action needed' | 'Investigate';

export interface Project {
  name: string;
  technologies: string[];
}

export interface ProjectContext {
  technologies: string[];
  projects: Project[];
}

export interface ReleaseEvent {
  id: string;
  source: string; // e.g., "github:nodejs/node", "aws:whats-new"
  technology: string; // e.g., "Node.js", "AWS"
  version: string;
  title: string;
  publishedAt: string;
  url: string;
  summary: string;
  isSecurity: boolean;
  isBreaking: boolean;
}

export interface ImpactAnalysis {
  releaseId: string;
  verdict: Verdict;
  reasoning: string;
  affectedProjects: string[];
  recommendedAction: string;
}

export interface EnrichedRelease extends ReleaseEvent {
  analysis?: ImpactAnalysis;
}
