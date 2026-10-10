import { EnrichedRelease } from './types';

export const mockReleases: EnrichedRelease[] = [
  {
    id: "demo-node-22-break",
    source: "github:nodejs/node",
    technology: "Node.js",
    version: "v22.0.0",
    title: "[DEMO] Node.js v22.0.0 (Current)",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    url: "https://nodejs.org/en/blog/release/v22.0.0",
    summary: "This release introduces require() for synchronous ES modules, a V8 update to 12.4, and several deprecations.",
    isSecurity: false,
    isBreaking: true,
    analysis: {
      releaseId: "demo-node-22-break",
      verdict: "Test first",
      reasoning: "Your project 'frontend-app' uses Node.js v20 (via .nvmrc). This major release introduces breaking changes to ES modules that may affect your build tools.",
      affectedProjects: ["frontend-app", "api-gateway"],
      recommendedAction: "Run your test suite in a Node.js 22 container before upgrading your production environments."
    }
  },
  {
    id: "demo-kube-sec",
    source: "github:kubernetes/kubernetes",
    technology: "Kubernetes",
    version: "v1.29.3",
    title: "[DEMO] CVE-2024-3154: Privilege Escalation in kube-apiserver",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    url: "https://github.com/kubernetes/kubernetes/issues/123456",
    summary: "A security issue was discovered in kube-apiserver that allows unauthenticated users to bypass certain authorization rules.",
    isSecurity: true,
    isBreaking: false,
    analysis: {
      releaseId: "demo-kube-sec",
      verdict: "Update now",
      reasoning: "Your production EKS cluster is running Kubernetes v1.29.1, which is vulnerable to CVE-2024-3154. This represents a critical risk.",
      affectedProjects: ["eks-prod-cluster", "eks-staging-cluster"],
      recommendedAction: "Apply the patch release v1.29.3 to your staging cluster immediately, then roll out to production."
    }
  },
  {
    id: "demo-react-minor",
    source: "github:facebook/react",
    technology: "React",
    version: "v18.3.0",
    title: "[DEMO] React v18.3.0",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    url: "https://reactjs.org/blog",
    summary: "Adds support for new hook useOptimistic, deprecates ReactDOM.render in favor of createRoot.",
    isSecurity: false,
    isBreaking: false,
    analysis: {
      releaseId: "demo-react-minor",
      verdict: "No action needed",
      reasoning: "Your projects are already using React 18.2 with createRoot, and this minor release does not affect your current feature set.",
      affectedProjects: ["frontend-app"],
      recommendedAction: "Upgrade at your convenience during the next routine dependency update cycle."
    }
  },
  {
    id: "demo-aws-whatsnew",
    source: "aws:whats-new",
    technology: "AWS EventBridge",
    version: "N/A",
    title: "[DEMO] Amazon EventBridge now supports AWS CloudTrail as a target",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    url: "https://aws.amazon.com/about-aws/whats-new/",
    summary: "You can now route Amazon EventBridge events directly to AWS CloudTrail data events for auditing and compliance.",
    isSecurity: false,
    isBreaking: false,
    analysis: {
      releaseId: "demo-aws-whatsnew",
      verdict: "Investigate",
      reasoning: "You use EventBridge extensively in the 'serverless-pipeline' project. This new feature could simplify your compliance auditing setup.",
      affectedProjects: ["serverless-pipeline"],
      recommendedAction: "Review the AWS documentation to see if this can replace your custom Lambda logging function."
    }
  }
];
