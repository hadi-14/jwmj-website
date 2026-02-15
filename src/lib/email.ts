import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.jwmj.org',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Additional options for better compatibility with custom SMTP
  tls: {
    // Don't fail on invalid certs (useful during development)
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },
  // Increase timeout for slower SMTP servers
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify SMTP connection on startup (optional but recommended)
if (process.env.NODE_ENV === 'development') {
  transporter.verify(function (error) {
    if (error) {
      console.error('❌ SMTP connection error:', error);
    } else {
      console.log('✅ SMTP server is ready to send emails');
    }
  });
}

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'JWMJ Member Portal'}" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@jwmj.org'}>`,
    to: email,
    subject: 'Email Verification Code - JWMJ Member Portal',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #038DCD 0%, #03BDCD 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #038DCD; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #038DCD; letter-spacing: 5px; font-family: monospace; }
            .info { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Email Verification</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">JWMJ Member Portal</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for registering with JWMJ Member Portal. To complete your registration, please use the verification code below:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <div class="info">
                <strong>⏱️ This code will expire in 10 minutes</strong>
              </div>
              
              <p><strong>Important Security Information:</strong></p>
              <ul>
                <li>Do not share this code with anyone</li>
                <li>JWMJ will never ask for your verification code via phone or SMS</li>
                <li>If you didn't request this code, please ignore this email and contact support</li>
                <li>You have 5 attempts to enter the correct code</li>
              </ul>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>JWMJ Portal Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} JWMJ. All rights reserved.</p>
              <p style="margin-top: 10px; color: #999;">This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
JWMJ Member Portal - Email Verification

Your verification code is: ${code}

IMPORTANT:
- This code will expire in 10 minutes
- Do not share this code with anyone
- You have 5 attempts to enter the correct code
- If you didn't request this code, please ignore this email

If you have any questions, please contact our support team.

Best regards,
JWMJ Portal Team

---
© ${new Date().getFullYear()} JWMJ. All rights reserved.
This is an automated message, please do not reply to this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Optional: Test email function for debugging
export async function sendTestEmail(to: string) {
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'JWMJ Member Portal'}" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@jwmj.org'}>`,
    to,
    subject: 'Test Email - SMTP Configuration Check',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; color: #155724; }
          </style>
        </head>
        <body>
          <div class="success">
            <h2>✅ SMTP Configuration Test Successful!</h2>
            <p>If you're seeing this email, your SMTP configuration is working correctly.</p>
            <hr>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>Host: ${process.env.SMTP_HOST}</li>
              <li>Port: ${process.env.SMTP_PORT}</li>
              <li>From: ${process.env.SMTP_FROM || process.env.SMTP_USER}</li>
              <li>Timestamp: ${new Date().toLocaleString()}</li>
            </ul>
          </div>
        </body>
      </html>
    `,
    text: `
SMTP Configuration Test - Success!

If you're seeing this email, your SMTP configuration is working correctly.

Configuration Details:
- Host: ${process.env.SMTP_HOST}
- Port: ${process.env.SMTP_PORT}
- From: ${process.env.SMTP_FROM || process.env.SMTP_USER}
- Timestamp: ${new Date().toLocaleString()}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Test email failed:', error);
    throw error;
  }
}