import { cookies } from 'next/headers';
import { successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('rabhta_token');
  return successResponse({ message: 'Logged out successfully' });
}
