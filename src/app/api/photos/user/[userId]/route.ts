import { NextRequest } from 'next/server';
import { getPhotosByUserHandle, getPhotosByUserHandleFromB2 } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Try to get photos from the database first
    let photos;
    try {
      photos = await getPhotosByUserHandle(userId);
    } catch (dbError) {
      console.error('Error fetching photos from database:', dbError);
      // Fallback to B2 storage if database query fails
      photos = await getPhotosByUserHandleFromB2(userId);
    }
    
    return Response.json({ photos });
  } catch (error) {
    console.error('Error in photos by user API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}