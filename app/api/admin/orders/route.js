import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true } }, address: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    return errorResponse('Failed to fetch orders', 500);
  }
}
