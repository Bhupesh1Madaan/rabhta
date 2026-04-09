import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, successResponse, slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sale = searchParams.get('sale');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where = { isActive: true };
    if (category) where.category = category;
    if (sale === 'true') where.salePrice = { not: null };
    if (featured === 'true') where.isFeatured = true;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to fetch products', 500);
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { name, description, category, price, salePrice, images, sizes, colors, stock, tags, isFeatured } = body;

    if (!name || !description || !category || !price) {
      return errorResponse('Name, description, category, and price are required');
    }

    const slug = slugify(name) + '-' + Date.now();
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: JSON.stringify(images || []),
        sizes: JSON.stringify(sizes || []),
        colors: JSON.stringify(colors || []),
        stock: JSON.stringify(stock || {}),
        tags: tags || '',
        isFeatured: !!isFeatured,
      },
    });

    return successResponse({ product }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse('Failed to create product', 500);
  }
}
