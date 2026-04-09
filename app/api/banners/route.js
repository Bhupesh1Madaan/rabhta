import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return successResponse({ banners });
  } catch (err) {
    return errorResponse('Failed to fetch banners', 500);
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { title, subtitle, imageUrl, linkUrl, buttonText, order } = body;
    if (!title || !imageUrl) return errorResponse('Title and image are required');

    const banner = await prisma.banner.create({
      data: { title, subtitle, imageUrl, linkUrl, buttonText, order: order || 0 },
    });
    return successResponse({ banner }, 201);
  } catch (err) {
    return errorResponse('Failed to create banner', 500);
  }
}
