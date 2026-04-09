import { NextResponse } from 'next/server';

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export const ORDER_STATUSES = [
  { key: 'placed', label: 'Order Placed', icon: '📦' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🏠' },
];

export const CATEGORIES = [
  'Dresses',
  'Tops & Blouses',
  'Jeans & Trousers',
  'Skirts',
  'Co-ord Sets',
  'Outerwear & Jackets',
  'Activewear',
  'Accessories',
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};
