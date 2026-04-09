import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const user = await requireAuth(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { id, ...(user.role !== 'admin' ? { userId: user.id } : {}) },
      include: { address: true },
    });

    if (!order) return errorResponse('Order not found', 404);
    return successResponse({ order });
  } catch (err) {
    return errorResponse('Failed to fetch order', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const { status, note } = await request.json();

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return errorResponse('Order not found', 404);

    const tracking = JSON.parse(order.trackingNotes || '[]');
    tracking.push({ status, note: note || '', timestamp: new Date().toISOString() });

    const updated = await prisma.order.update({
      where: { id },
      data: { status, trackingNotes: JSON.stringify(tracking) },
      include: { address: true },
    });

    return successResponse({ order: updated });
  } catch (err) {
    return errorResponse('Failed to update order', 500);
  }
}
