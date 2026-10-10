import { ReleaseEvent, ImpactAnalysis, ProjectContext } from '../types';

/**
 * Deterministic rules-based impact analysis.
 * Used as a fallback when Bedrock is unavailable or for predictable tests.
 */
export function analyzeWithRules(release: ReleaseEvent, projectContext: ProjectContext): ImpactAnalysis {
  // Check if technology is used by the project
  const isUsed = projectContext.technologies.includes(release.technology.toLowerCase());
  
  if (!isUsed) {
    return {
      releaseId: release.id,
      verdict: 'No action needed',
      reasoning: `Your projects do not appear to use ${release.technology} based on current configuration.`,
      affectedProjects: [],
      recommendedAction: 'No action required.'
    };
  }

  // If used, find affected projects
  const affectedProjects = projectContext.projects
    .filter(p => p.technologies.includes(release.technology.toLowerCase()))
    .map(p => p.name);

  // Security fixes are highest priority
  if (release.isSecurity) {
    return {
      releaseId: release.id,
      verdict: 'Update now',
      reasoning: `A security vulnerability was fixed in ${release.technology}. Your projects are potentially exposed.`,
      affectedProjects,
      recommendedAction: `Review the security advisory and patch to ${release.version} immediately.`
    };
  }

  // Breaking changes
  if (release.isBreaking) {
    return {
      releaseId: release.id,
      verdict: 'Test first',
      reasoning: `This release of ${release.technology} introduces breaking changes that might affect your setup.`,
      affectedProjects,
      recommendedAction: 'Run your test suite against the new version in a staging environment before upgrading.'
    };
  }

  // General release (could be minor, bug fix, feature)
  return {
    releaseId: release.id,
    verdict: 'Investigate',
    reasoning: `A new version of ${release.technology} (${release.version}) is available. It may contain useful bug fixes or features.`,
    affectedProjects,
    recommendedAction: 'Review the release notes to see if you benefit from the changes.'
  };
}

/**
 * Bedrock-based impact analysis (Mocked implementation for this file, to be implemented with real SDK later)
 */
export async function analyzeWithBedrock(release: ReleaseEvent, projectContext: ProjectContext): Promise<ImpactAnalysis> {
  // Try to use Bedrock if configured
  if (!process.env.BEDROCK_ENABLED || process.env.BEDROCK_ENABLED !== 'true') {
    throw new Error('Bedrock is not enabled or configured.');
  }

  // Real implementation would invoke @aws-sdk/client-bedrock-runtime here.
  // We throw error to trigger fallback in tests.
  throw new Error('Bedrock invocation failed or throttled');
}

/**
 * Main analysis engine facade.
 * Tries AI first (if enabled), falls back to rules.
 */
export async function analyzeRelease(release: ReleaseEvent, projectContext: ProjectContext): Promise<ImpactAnalysis> {
  try {
    if (process.env.BEDROCK_ENABLED === 'true') {
      return await analyzeWithBedrock(release, projectContext);
    }
  } catch (error) {
    console.warn(`Bedrock analysis failed, falling back to rules engine: ${(error as Error).message}`);
  }
  
  return analyzeWithRules(release, projectContext);
}
