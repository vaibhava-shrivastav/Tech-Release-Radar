# Tech Release Radar

Tech Release Radar is a personal technology intelligence agent that continuously monitors software releases, security advisories, and breaking changes. It uses project-aware impact analysis to tell you: **"What changed, should I care, and what should I do next?"**

## Features

- **Project-Aware Impact Analysis:** Doesn't just list updates; evaluates them against your specific tech stack.
- **"Should I care?" Verdicts:** Categorizes updates into actionable recommendations (Update now, Test first, No action needed, Investigate).
- **Demo Mode:** Explore a rich, populated UI without needing AWS credentials or GitHub tokens.
- **Automated Ingestion (API):** Built-in backend to fetch and normalize from GitHub Releases and AWS What's New.

## Architecture

This project is built using Next.js (App Router), enabling a unified Full-Stack serverless deployment architecture.

- **Frontend:** React + TypeScript with a custom Glassmorphism UI (Vanilla CSS).
- **Backend API:** Next.js Route Handlers (`/api/ingest`).
- **AWS Integration:**
  - **Amazon EventBridge Scheduler:** Can trigger the `/api/ingest` endpoint automatically.
  - **AWS Lambda / AWS Amplify:** The Next.js app can be deployed effortlessly via AWS Amplify to Edge Locations.
  - **Amazon DynamoDB:** Persistent storage for deduplication (setup required).
  - **Amazon Bedrock:** Analyzes release notes based on project contexts. *(Optional: A robust, deterministic rules-based engine runs locally by default without requiring AWS credentials).*

## Local Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables

Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`
*(For the demo mode, no API keys or AWS credentials are required. The AI engine is disabled by default via `BEDROCK_ENABLED=false`).*

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the dashboard. You can toggle **"Demo (Fixtures)"** to see how the system handles different types of releases.

## AWS Deployment (us-east-1)

To deploy to AWS Amplify:

1. Push your repository to GitHub.
2. Navigate to the **AWS Amplify Console** in the `us-east-1` region.
3. Choose **Create a new app** and connect your GitHub repository.
4. AWS Amplify will automatically detect the Next.js framework.
5. Ensure the IAM execution role created by Amplify has `bedrock:InvokeModel` and `dynamodb:PutItem` permissions (if using those optional features).
6. Run the deployment. 

*(Note: DynamoDB tables must be configured in your AWS account if you want persistence across serverless cold-starts. Currently, the app uses an in-memory storage adapter that will reset between invocations on AWS).*

## Scheduled Monitoring (EventBridge)

To run background checks on a schedule, you can configure an **Amazon EventBridge Scheduler** schedule:
1. In the AWS Console, open **Amazon EventBridge** > **Scheduler** > **Schedules**.
2. Create a schedule (e.g., `rate(1 hour)`).
3. Select **Universal target** > **HTTPS**.
4. Set the URL to your deployed endpoint: `https://<your-amplify-domain>/api/ingest`.
5. Set Method to `POST`.
6. Configure the execution role to allow `events:InvokeApiDestination`.

*(Note: Scheduled monitoring is currently NOT active until you explicitly deploy the app and configure this EventBridge schedule).*

## Git Commit & Push Instructions

To save and push these changes, run the following commands in PowerShell:

\`\`\`powershell
git add .
git commit -m "feat: implement live github release ingestion and deterministic analysis fallback"
git push -u origin feat/tech-release-radar-agent
\`\`\`

## Demo Flow for AWS Builder Center

1. Start the application locally with `npm run dev`.
2. Ensure the UI toggle is set to **Demo (Fixtures)**.
3. Highlight the **"Test First"** Node.js breaking change—explain how the agent knows the project is on Node 20 and recommends testing before a Node 22 upgrade.
4. Highlight the **"Update Now"** Kubernetes CVE—show how the agent flags the affected EKS clusters directly.
5. Click **"Check Now"** to simulate the ingestion and deduplication engine triggering.
