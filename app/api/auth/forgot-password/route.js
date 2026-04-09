import { prisma } from '@/lib/db';
import { errorResponse, successResponse, generateOTP } from '@/lib/utils';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return errorResponse('Email is required');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return success to prevent email enumeration
    if (!user) return successResponse({ message: 'If this email exists, you will receive a code.' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.oTP.create({
      data: { email: user.email, code: otp, purpose: 'reset_password', expiresAt },
    });

    await sendOTPEmail(user.email, user.name, otp, 'reset_password');
    return successResponse({ message: 'If this email exists, you will receive a code.' });
  } catch (err) {
    console.error(err);
    return errorResponse('Something went wrong', 500);
  }
}
