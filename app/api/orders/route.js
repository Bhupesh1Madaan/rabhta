import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { address: true },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse({ orders });
  } catch (err) {
    return errorResponse('Failed to fetch orders', 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    if (!user) return errorResponse('Please login to place an order', 401);

    const body = await request.json();
    const { addressId, address, items, subtotal, discount, offerCode, deliveryFee, total, paymentMethod } = body;

    if ((!addressId && !address) || !items?.length) return errorResponse('Address and items are required');

    let finalAddressId = addressId;
    if (address && !addressId) {
      const newAddr = await prisma.address.create({
        data: {
          userId: user.id,
          title: 'Checkout Address',
          line1: address.line1,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.phone,
        }
      });
      finalAddressId = newAddr.id;
    }

    // Validate offer if applied
    if (offerCode) {
      const offer = await prisma.offer.findFirst({
        where: {
          code: offerCode.toUpperCase(),
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (!offer) return errorResponse('Invalid or expired offer code');
      if (offer.maxUses && offer.usedCount >= offer.maxUses) return errorResponse('Offer code has reached its usage limit');
      await prisma.offer.update({ where: { id: offer.id }, data: { usedCount: offer.usedCount + 1 } });
    }

    const initialTracking = JSON.stringify([{
      status: 'placed',
      note: 'Your order has been placed successfully.',
      timestamp: new Date().toISOString(),
    }]);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: finalAddressId,
        items: JSON.stringify(items),
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount || 0),
        offerCode,
        deliveryFee: parseFloat(deliveryFee || 50),
        total: parseFloat(total),
        paymentMethod: paymentMethod || 'card',
        trackingNotes: initialTracking,
        orderItems: {
          create: items.map(item => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
      include: { address: true },
    });

    // Send confirmation email
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    await sendOrderConfirmationEmail(fullUser.email, fullUser.name, order);

    return successResponse({ order }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to place order', 500);
  }
}
