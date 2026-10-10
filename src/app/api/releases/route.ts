import { NextResponse } from 'next/server';
import { getReleases } from '@/lib/services/storage';

export async function GET() {
  try {
    const releases = await getReleases();
    return NextResponse.json({ success: true, releases });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch releases' }, { status: 500 });
  }
}
