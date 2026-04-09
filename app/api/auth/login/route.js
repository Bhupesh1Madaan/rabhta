import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return errorResponse('Email and password are required');

    // Hardcoded dev admin bypass requested by user
    if (email === 'admin@email.com' && password === 'admin123456') {
      const token = signToken({ id: 'dev-admin', email: 'admin@email.com', name: 'Super Admin', role: 'admin' });
      const cookieStore = await cookies();
      cookieStore.set('rabhta_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return successResponse({
        user: { id: 'dev-admin', name: 'Super Admin', email: 'admin@email.com', role: 'admin' },
      });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return errorResponse('Invalid email or password', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return errorResponse('Invalid email or password', 401);

    if (!user.emailVerified) {
      return errorResponse('Please verify your email before logging in. Check your inbox.', 403);
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set('rabhta_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return successResponse({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return errorResponse('Something went wrong', 500);
  }
}
