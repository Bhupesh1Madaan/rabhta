const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const dummyProducts = [
  {
    name: 'Ivory Lace Midi Dress',
    slug: 'ivory-lace-midi-dress',
    description: 'Elegant midi dress in delicate ivory lace overlay. Features a fitted bodice with subtle floral appliqué and a flowing A-line skirt. Perfect for brunches, celebrations, and special occasions.',
    category: 'Dresses',
    price: 4999,
    salePrice: 3999,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify([{ name: 'Ivory', hex: '#FFFFF0' }, { name: 'Blush', hex: '#FFB6C1' }]),
    stock: JSON.stringify({ 'XS': { 'Ivory': 5, 'Blush': 3 }, 'S': { 'Ivory': 8, 'Blush': 6 }, 'M': { 'Ivory': 10, 'Blush': 8 }, 'L': { 'Ivory': 6, 'Blush': 4 }, 'XL': { 'Ivory': 3, 'Blush': 2 } }),
    tags: 'lace,midi,dress,elegant',
    isFeatured: true,
  },
  {
    name: 'Champagne Satin Slip Dress',
    slug: 'champagne-satin-slip-dress',
    description: 'Luxuriously smooth satin slip dress in champagne gold. Bias-cut silhouette that drapes beautifully over every curve. Adjustable thin straps and a delicate back slit.',
    category: 'Dresses',
    price: 5499,
    salePrice: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([{ name: 'Champagne', hex: '#F7E7CE' }, { name: 'Dusty Rose', hex: '#DCAE96' }, { name: 'Black', hex: '#1a1a1a' }]),
    stock: JSON.stringify({ 'XS': { 'Champagne': 4 }, 'S': { 'Champagne': 7, 'Dusty Rose': 5 }, 'M': { 'Champagne': 9, 'Dusty Rose': 7, 'Black': 8 }, 'L': { 'Black': 6 }, 'XL': { 'Black': 4 }, 'XXL': { 'Black': 2 } }),
    tags: 'satin,slip,dress,luxury',
    isFeatured: true,
  },
  {
    name: 'Floral Chiffon Wrap Blouse',
    slug: 'floral-chiffon-wrap-blouse',
    description: 'Feminine floral chiffon blouse with a flattering wrap-style front. A versatile piece that transitions effortlessly from office to evening. Lightweight and breathable fabric.',
    category: 'Tops & Blouses',
    price: 2299,
    salePrice: 1799,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800',
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify([{ name: 'Floral Blush', hex: '#F4C2C2' }, { name: 'Floral Navy', hex: '#1F3A5F' }]),
    stock: JSON.stringify({ 'XS': { 'Floral Blush': 8 }, 'S': { 'Floral Blush': 12, 'Floral Navy': 10 }, 'M': { 'Floral Blush': 15, 'Floral Navy': 12 }, 'L': { 'Floral Blush': 10, 'Floral Navy': 8 }, 'XL': { 'Floral Blush': 5, 'Floral Navy': 4 } }),
    tags: 'blouse,floral,chiffon,wrap',
    isFeatured: true,
  },
  {
    name: 'Wide-Leg Linen Trousers',
    slug: 'wide-leg-linen-trousers',
    description: 'Effortlessly chic wide-leg trousers in premium linen. High-rise waist with a flattering relaxed fit through the leg. Style with a tucked-in blouse or bodysuit for a polished look.',
    category: 'Jeans & Trousers',
    price: 3499,
    salePrice: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1594938298603-3e4b7d6ab4e8?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([{ name: 'Sand', hex: '#C2B280' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Sage', hex: '#B2C9AD' }]),
    stock: JSON.stringify({ 'XS': { 'Sand': 6, 'White': 4 }, 'S': { 'Sand': 10, 'White': 8, 'Sage': 6 }, 'M': { 'Sand': 12, 'White': 10, 'Sage': 8 }, 'L': { 'Sand': 8, 'White': 6, 'Sage': 5 }, 'XL': { 'Sand': 5, 'White': 3 }, 'XXL': { 'Sand': 3 } }),
    tags: 'trousers,linen,wide-leg,casual',
    isFeatured: false,
  },
  {
    name: 'Terracotta Linen Co-ord Set',
    slug: 'terracotta-linen-coord-set',
    description: 'Stunning co-ord set featuring a cropped blazer and wide-leg palazzos in warm terracotta linen. The perfect statement set for any occasion — mix and match or wear together.',
    category: 'Co-ord Sets',
    price: 7999,
    salePrice: 6499,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify([{ name: 'Terracotta', hex: '#C66B3D' }, { name: 'Mustard', hex: '#E1C16E' }]),
    stock: JSON.stringify({ 'XS': { 'Terracotta': 3 }, 'S': { 'Terracotta': 6, 'Mustard': 5 }, 'M': { 'Terracotta': 8, 'Mustard': 7 }, 'L': { 'Terracotta': 5, 'Mustard': 4 }, 'XL': { 'Terracotta': 2, 'Mustard': 2 } }),
    tags: 'coord,set,linen,blazer,palazzo',
    isFeatured: true,
  },
  {
    name: 'Pleated Satin Mini Skirt',
    slug: 'pleated-satin-mini-skirt',
    description: 'Luxurious pleated mini skirt in liquid satin finish. Sits at the natural waist with elegant box pleats throughout. Pairs beautifully with fitted knitwear or oversized blazers.',
    category: 'Skirts',
    price: 2799,
    salePrice: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify([{ name: 'Champagne', hex: '#F7E7CE' }, { name: 'Midnight Blue', hex: '#191970' }, { name: 'Wine', hex: '#722F37' }]),
    stock: JSON.stringify({ 'XS': { 'Champagne': 5, 'Wine': 4 }, 'S': { 'Champagne': 8, 'Midnight Blue': 6, 'Wine': 6 }, 'M': { 'Champagne': 10, 'Midnight Blue': 8, 'Wine': 7 }, 'L': { 'Midnight Blue': 5, 'Wine': 4 }, 'XL': { 'Midnight Blue': 3 } }),
    tags: 'skirt,satin,pleated,mini',
    isFeatured: false,
  },
  {
    name: 'Camel Wool Blend Overcoat',
    slug: 'camel-wool-blend-overcoat',
    description: 'Classic camel overcoat in premium wool-blend fabric. Structured silhouette with double-breasted buttons and a statement lapel collar. The ultimate elevated layering piece.',
    category: 'Outerwear & Jackets',
    price: 12999,
    salePrice: 9999,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
    colors: JSON.stringify([{ name: 'Camel', hex: '#C19A6B' }, { name: 'Charcoal', hex: '#36454F' }]),
    stock: JSON.stringify({ 'XS': { 'Camel': 3 }, 'S': { 'Camel': 5, 'Charcoal': 4 }, 'M': { 'Camel': 7, 'Charcoal': 6 }, 'L': { 'Camel': 5, 'Charcoal': 4 }, 'XL': { 'Camel': 2, 'Charcoal': 2 } }),
    tags: 'coat,overcoat,wool,winter,camel',
    isFeatured: true,
  },
  {
    name: 'Ribbed Knit Bodysuit',
    slug: 'ribbed-knit-bodysuit',
    description: 'Sleek ribbed knit bodysuit with a scoop neckline and snap closures at the base. A wardrobe essential that layers perfectly under high-waisted bottoms for a seamless silhouette.',
    category: 'Tops & Blouses',
    price: 1899,
    salePrice: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([{ name: 'Cream', hex: '#FFFDD0' }, { name: 'Mocha', hex: '#967259' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'Dusty Pink', hex: '#D4A5A5' }]),
    stock: JSON.stringify({ 'XS': { 'Cream': 8, 'Black': 10 }, 'S': { 'Cream': 12, 'Mocha': 8, 'Black': 15, 'Dusty Pink': 10 }, 'M': { 'Cream': 15, 'Mocha': 12, 'Black': 18, 'Dusty Pink': 12 }, 'L': { 'Mocha': 8, 'Black': 12, 'Dusty Pink': 8 }, 'XL': { 'Black': 8 }, 'XXL': { 'Black': 4 } }),
    tags: 'bodysuit,knit,ribbed,essential',
    isFeatured: false,
  },
  {
    name: 'Emerald Wrap Midi Dress',
    slug: 'emerald-wrap-midi-dress',
    description: 'Head-turning wrap midi dress in rich emerald crepe. V-neckline with adjustable tie-closure creates a universally flattering silhouette. Light and fluid fabric with a subtle sheen.',
    category: 'Dresses',
    price: 4499,
    salePrice: 3799,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=800',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([{ name: 'Emerald', hex: '#50C878' }, { name: 'Burgundy', hex: '#800020' }]),
    stock: JSON.stringify({ 'XS': { 'Emerald': 4, 'Burgundy': 3 }, 'S': { 'Emerald': 7, 'Burgundy': 6 }, 'M': { 'Emerald': 9, 'Burgundy': 8 }, 'L': { 'Emerald': 6, 'Burgundy': 5 }, 'XL': { 'Emerald': 3, 'Burgundy': 3 }, 'XXL': { 'Burgundy': 2 } }),
    tags: 'dress,wrap,midi,emerald,v-neck',
    isFeatured: true,
  },
  {
    name: 'High-Rise Straight Jeans',
    slug: 'high-rise-straight-jeans',
    description: 'The perfect everyday straight jeans in premium stretch denim. High-rise cut with a relaxed straight leg for an elongating effect. Fade-resistant fabric in a timeless mid-wash.',
    category: 'Jeans & Trousers',
    price: 3299,
    salePrice: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
    ]),
    sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    colors: JSON.stringify([{ name: 'Mid Wash', hex: '#5B7FA6' }, { name: 'Dark Wash', hex: '#1C2951' }, { name: 'Light Wash', hex: '#A8C1D4' }]),
    stock: JSON.stringify({ 'XS': { 'Mid Wash': 6, 'Light Wash': 4 }, 'S': { 'Mid Wash': 10, 'Dark Wash': 8, 'Light Wash': 7 }, 'M': { 'Mid Wash': 14, 'Dark Wash': 12, 'Light Wash': 9 }, 'L': { 'Mid Wash': 10, 'Dark Wash': 8 }, 'XL': { 'Mid Wash': 6, 'Dark Wash': 5 }, 'XXL': { 'Dark Wash': 3 } }),
    tags: 'jeans,denim,straight,high-rise',
    isFeatured: false,
  },
];

const dummyBanners = [
  {
    title: 'New Season Arrivals',
    subtitle: 'Discover the finest women\'s western fashion curated for the modern woman',
    imageUrl: 'https://images.unsplash.com/photo-1558171813-76b16c9b5d53?w=1920',
    linkUrl: '/products?sort=newest',
    buttonText: 'Shop New In',
    order: 0,
  },
  {
    title: 'The Co-ord Edit',
    subtitle: 'Effortlessly chic matching sets handpicked for every occasion',
    imageUrl: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=1920',
    linkUrl: '/products?category=Co-ord+Sets',
    buttonText: 'Explore Sets',
    order: 1,
  },
  {
    title: 'Up to 30% Off — Sale',
    subtitle: 'Limited time offers on selected styles',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920',
    linkUrl: '/products?sale=true',
    buttonText: 'Shop Sale',
    order: 2,
  },
];

const dummyOffers = [
  {
    code: 'RABHTA10',
    description: '10% off your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    maxUses: 1000,
    expiresAt: new Date('2025-12-31'),
  },
  {
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹2999',
    discountType: 'flat',
    discountValue: 500,
    minOrderAmount: 2999,
    maxUses: 500,
    expiresAt: new Date('2025-06-30'),
  },
];

async function main() {
  console.log('🌱 Seeding Rabhta database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Rabhta@Admin2024', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@rabhta.com' },
    update: {},
    create: {
      name: 'Rabhta Admin',
      email: process.env.ADMIN_EMAIL || 'admin@rabhta.com',
      password: adminPassword,
      role: 'admin',
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create banners
  for (const banner of dummyBanners) {
    await prisma.banner.upsert({
      where: { id: banner.title.replace(/\s/g, '-').toLowerCase() },
      update: banner,
      create: { ...banner, id: banner.title.replace(/\s/g, '-').toLowerCase() },
    });
  }
  console.log('✅ Banners created');

  // Create products
  for (const product of dummyProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log('✅ Products created:', dummyProducts.length);

  // Create offers
  for (const offer of dummyOffers) {
    await prisma.offer.upsert({
      where: { code: offer.code },
      update: offer,
      create: offer,
    });
  }
  console.log('✅ Offers created');

  console.log('\n🎉 Seed complete! Admin credentials:');
  console.log('   Email:', process.env.ADMIN_EMAIL || 'admin@rabhta.com');
  console.log('   Password: Rabhta@Admin2024');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
