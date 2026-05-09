import * as nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

let _transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

export async function sendVerificationEmail({
  to,
  name,
  token,
}: SendVerificationEmailParams): Promise<void> {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: '请验证您的邮箱地址',
    text: [
      `您好 ${name}，`,
      '',
      '请点击以下链接验证您的邮箱地址（24小时内有效）：',
      verificationUrl,
      '',
      '如果您没有注册，请忽略此邮件。',
    ].join('\n'),
    html: [
      '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">',
      '  <h2>验证您的邮箱地址</h2>',
      `  <p>您好 ${name}，</p>`,
      '  <p>请点击下方按钮验证您的邮箱地址（24小时内有效）：</p>',
      `  <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">验证邮箱</a>`,
      '  <p style="color: #666; font-size: 14px;">如果按钮无法点击，请复制以下链接到浏览器：<br/>',
      `  ${verificationUrl}</p>`,
      '  <p style="color: #999; font-size: 12px;">如果您没有注册，请忽略此邮件。</p>',
      '</div>',
    ].join('\n'),
  });
}

export function generateVerificationToken(): string {
  return crypto.randomUUID();
}

export function getTokenExpiry(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}
