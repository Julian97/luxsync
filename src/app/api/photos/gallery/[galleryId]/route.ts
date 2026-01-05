import { NextRequest } from 'next/server';
import { getPhotosForGallery } from '@/utils/b2/gallery-parser';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const { galleryId } = await params;
    
    if (!galleryId) {
      return Response.json(
        { error: 'galleryId is required' },
        { status: 400 }
      );
    }

    const photos = await getPhotosForGallery(galleryId);
    
    return Response.json({ photos });
  } catch (error) {
    console.error('Error in photos by gallery API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}