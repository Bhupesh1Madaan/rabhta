import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET() {
  const payload = await getCurrentUser();
  if (!payload) return errorResponse('Not authenticated', 401);

  // Exception for the hardcoded local development bypass
  if (payload.id === 'dev-admin') {
    return successResponse({
      user: { id: 'dev-admin', name: 'Super Admin', email: 'admin@email.com', role: 'admin', emailVerified: true }
    });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, phone: true, createdAt: true },
  });
  
  if (!user) return errorResponse('User not found', 404);
  return successResponse({ user });
}
