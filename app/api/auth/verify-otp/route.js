import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) return errorResponse('Email and OTP are required');

    const record = await prisma.oTP.findFirst({
      where: {
        email: email.toLowerCase(),
        code: otp,
        purpose: 'verify_email',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return errorResponse('Invalid or expired code. Please request a new one.', 400);

    await prisma.oTP.update({ where: { id: record.id }, data: { used: true } });
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: true },
    });

    return successResponse({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    return errorResponse('Something went wrong', 500);
  }
}
