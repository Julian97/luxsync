import { NextRequest } from 'next/server';
import { getGalleriesFromB2 } from '@/utils/b2/gallery-parser';

export async function GET(request: NextRequest) {
  try {
    const galleries = await getGalleriesFromB2();

    return Response.json({
      galleries,
      message: 'Galleries retrieved successfully'
    });
  } catch (error) {
    console.error('Error in galleries API:', error);
    return Response.json(
      { error: 'Failed to retrieve galleries from B2 storage' },
      { status: 500 }
    );
  }
}