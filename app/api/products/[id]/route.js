import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse, slugify } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }], isActive: true },
    });
    if (!product) return errorResponse('Product not found', 404);
    return successResponse({ product });
  } catch (err) {
    return errorResponse('Failed to fetch product', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await request.json();
    const { name, description, category, price, salePrice, images, sizes, colors, stock, tags, isFeatured, isActive } = body;

    const data = {};
    if (name !== undefined) { data.name = name; data.slug = slugify(name) + '-' + id.slice(-6); }
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (price !== undefined) data.price = parseFloat(price);
    if (salePrice !== undefined) data.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (images !== undefined) data.images = JSON.stringify(images);
    if (sizes !== undefined) data.sizes = JSON.stringify(sizes);
    if (colors !== undefined) data.colors = JSON.stringify(colors);
    if (stock !== undefined) data.stock = JSON.stringify(stock);
    if (tags !== undefined) data.tags = tags;
    if (isFeatured !== undefined) data.isFeatured = !!isFeatured;
    if (isActive !== undefined) data.isActive = !!isActive;

    const product = await prisma.product.update({ where: { id }, data });
    return successResponse({ product });
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to update product', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return successResponse({ message: 'Product deactivated' });
  } catch (err) {
    return errorResponse('Failed to delete product', 500);
  }
}
