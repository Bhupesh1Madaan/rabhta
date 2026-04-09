import { prisma } from '@/lib/db';
import { errorResponse, successResponse, generateOTP } from '@/lib/utils';
import { sendOTPEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return errorResponse('All fields are required');
    if (password.length < 8) return errorResponse('Password must be at least 8 characters');

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return errorResponse('An account with this email already exists');

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashed },
    });

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await prisma.oTP.create({
      data: { email: user.email, code: otp, purpose: 'verify_email', expiresAt },
    });

    // Send email
    const emailResult = await sendOTPEmail(user.email, user.name, otp, 'verify_email');
    if (!emailResult.success) {
      console.warn('Email send failed:', emailResult.error);
    }

    return successResponse({
      message: 'Account created. Please check your email for the verification code.',
      email: user.email,
    }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse('Something went wrong', 500);
  }
}
