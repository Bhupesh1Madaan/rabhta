import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await request.json();
    const banner = await prisma.banner.update({ where: { id }, data: body });
    return successResponse({ banner });
  } catch (err) {
    return errorResponse('Failed to update banner', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    await prisma.banner.delete({ where: { id } });
    return successResponse({ message: 'Banner deleted' });
  } catch (err) {
    return errorResponse('Failed to delete banner', 500);
  }
}
