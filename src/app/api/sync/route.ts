import { NextRequest } from 'next/server';
import { syncGalleriesToDatabase } from '@/utils/sync/gallery-sync';

export async function GET(request: NextRequest) {
  try {
    console.log('Sync API called');
    
    // Run the sync process
    await syncGalleriesToDatabase();
    
    return Response.json({
      message: 'Gallery sync completed successfully'
    });
  } catch (error) {
    console.error('Error in sync API:', error);
    return Response.json(
      { error: 'Failed to sync galleries from B2 to database' },
      { status: 500 }
    );
  }
}