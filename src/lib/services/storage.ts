import { EnrichedRelease } from '../types';
import { mockReleases } from '../mock-data';

// In a real Serverless deployment (AWS Lambda/Amplify), this in-memory array
// will NOT persist across cold starts. 
// A real deployment should implement DynamoDB here if persistence is required.
let inMemoryStore: EnrichedRelease[] = [];

export async function getReleases(): Promise<EnrichedRelease[]> {
  return inMemoryStore;
}

export async function saveRelease(release: EnrichedRelease): Promise<void> {
  const index = inMemoryStore.findIndex(r => r.id === release.id);
  if (index !== -1) {
    inMemoryStore[index] = release;
  } else {
    inMemoryStore = [release, ...inMemoryStore];
  }
}

export async function releaseExists(id: string): Promise<boolean> {
  return inMemoryStore.some(r => r.id === id);
}

// Helper to seed with mock data if needed for Demo
export async function seedMockData() {
  inMemoryStore = [...mockReleases];
}
