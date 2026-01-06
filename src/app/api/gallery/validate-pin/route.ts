import { NextRequest } from 'next/server';
import { validateGalleryAccess } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { folderName, pin } = await request.json();

    if (!folderName || !pin) {
      return new Response(
        JSON.stringify({ error: 'folderName and pin are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await validateGalleryAccess(folderName, pin);

    return new Response(
      JSON.stringify({ valid: isValid }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error validating gallery access:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}