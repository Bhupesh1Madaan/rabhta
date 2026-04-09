import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email, name, otp, purpose = 'verify_email') {
  const subject = purpose === 'verify_email'
    ? 'Verify your Rabhta account'
    : 'Reset your Rabhta password';

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FDFAF6; padding: 40px;">
      <div style="text-align: center; border-bottom: 2px solid #C9A96E; padding-bottom: 24px; margin-bottom: 32px;">
        <h1 style="font-size: 36px; letter-spacing: 4px; color: #3D2B1F; margin: 0;">RABHTA</h1>
        <p style="color: #8B7355; font-size: 12px; letter-spacing: 3px; margin: 8px 0 0;">WOMEN'S WESTERN FASHION</p>
      </div>
      <h2 style="color: #3D2B1F; font-size: 22px; margin-bottom: 16px;">Hello, ${name}</h2>
      <p style="color: #5C4A35; font-size: 16px; line-height: 1.6;">
        ${purpose === 'verify_email'
          ? 'Thank you for joining Rabhta. Please verify your email address using the code below:'
          : 'We received a request to reset your password. Use the code below:'}
      </p>
      <div style="background: #F0E6D3; border: 1px solid #C9A96E; border-radius: 8px; padding: 32px; text-align: center; margin: 32px 0;">
        <p style="color: #8B7355; font-size: 12px; letter-spacing: 2px; margin: 0 0 8px;">YOUR VERIFICATION CODE</p>
        <h1 style="color: #3D2B1F; font-size: 48px; letter-spacing: 12px; margin: 0; font-weight: 300;">${otp}</h1>
        <p style="color: #8B7355; font-size: 12px; margin: 16px 0 0;">This code expires in 10 minutes</p>
      </div>
      <p style="color: #8B7355; font-size: 13px;">If you didn't request this, please ignore this email.</p>
      <div style="border-top: 1px solid #E8D5B7; margin-top: 32px; padding-top: 24px; text-align: center;">
        <p style="color: #B8A090; font-size: 12px; letter-spacing: 1px;">© 2024 RABHTA. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Rabhta <noreply@rabhta.com>',
      to: email,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderConfirmationEmail(email, name, order) {
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FDFAF6; padding: 40px;">
      <div style="text-align: center; border-bottom: 2px solid #C9A96E; padding-bottom: 24px; margin-bottom: 32px;">
        <h1 style="font-size: 36px; letter-spacing: 4px; color: #3D2B1F; margin: 0;">RABHTA</h1>
      </div>
      <h2 style="color: #3D2B1F;">Order Confirmed! 🎉</h2>
      <p style="color: #5C4A35;">Thank you ${name}, your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
      <div style="background: #F0E6D3; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #3D2B1F; margin: 0;"><strong>Total: ₹${order.total}</strong></p>
        <p style="color: #8B7355; margin: 8px 0 0; font-size: 14px;">Estimated delivery: 5-7 business days</p>
      </div>
      <p style="color: #5C4A35;">Track your order anytime from your account dashboard.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Rabhta <noreply@rabhta.com>',
      to: email,
      subject: `Order Confirmed — #${order.id.slice(-8).toUpperCase()} | Rabhta`,
      html,
    });
  } catch (error) {
    console.error('Order email error:', error);
  }
}
