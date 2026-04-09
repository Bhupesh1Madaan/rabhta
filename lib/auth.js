import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'rabhta-secret';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('rabhta_token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(request) {
  const token = request.cookies.get('rabhta_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(request) {
  const user = await requireAuth(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}
