import { NextRequest } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return Response.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Compare the provided password with the stored password
    const isValid = isAdminAuthenticated(password);

    if (isValid) {
      // In a real application, you'd create a session token here
      return Response.json({ success: true, message: 'Login successful' });
    } else {
      return Response.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}