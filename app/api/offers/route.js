import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse({ offers });
  } catch (err) {
    return errorResponse('Failed to fetch offers', 500);
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = body;

    if (!code || !discountType || !discountValue) {
      return errorResponse('Code, discount type, and value are required');
    }

    const offer = await prisma.offer.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return successResponse({ offer }, 201);
  } catch (err) {
    if (err.code === 'P2002') return errorResponse('This coupon code already exists');
    return errorResponse('Failed to create offer', 500);
  }
}
