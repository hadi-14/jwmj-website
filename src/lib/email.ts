import nodemailer from 'nodemailer';
import path from 'path';

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

// The registration objects passed here are loosely typed; for now we
// only rely on a couple of known properties.  Keep the definitions narrow
// enough to satisfy the linter while still matching the actual shape.
interface InvitationHead {
  groupId?: string;
  memberEmail?: string;
  memberName?: string;
  event: {
    date: string;
    title?: string;
    category?: string;
    id?: string;
    time?: string;
    islamicDate?: string;
    venue?: string;
    desc?: string;
  };
  [key: string]: unknown;
}
interface InvitationMember {
  isHead?: boolean;
  memberName?: string;
  [key: string]: unknown;
}

export async function sendEventInvitationEmail(
  headRegistration: InvitationHead,
  allRegistrations: InvitationMember[]
) {
  const event = headRegistration.event;
  const totalAttendees = allRegistrations.length;
  const avatarLetter = (name: string) => (name || '?').trim()[0].toUpperCase();

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Build attendee rows (table-based, Gmail safe)
  const attendeeRows = allRegistrations.map((r, i) => {
    const isLast = i === allRegistrations.length - 1;
    const avatarBg = r.isHead
      ? 'background:linear-gradient(135deg,#0D2B3E,#01557A);'
      : 'background:linear-gradient(135deg,#038DCD,#03BDCD);';
    return `
      <tr>
        <td style="padding:12px 18px;${isLast ? '' : 'border-bottom:1px solid #F0F7FC;'}">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;padding-right:13px;">
              <div style="width:36px;height:36px;border-radius:50%;${avatarBg}
                text-align:center;line-height:36px;
                font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;">
                ${avatarLetter(r.memberName)}
              </div>
            </td>
            <td style="vertical-align:middle;font-family:Arial,sans-serif;
              font-size:14px;color:#1A3547;">${r.memberName}</td>
            ${r.isHead ? `
            <td style="vertical-align:middle;padding-left:12px;">
              <div style="background:#E4EEF6;border-radius:20px;padding:3px 10px;
                font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;
                letter-spacing:0.8px;text-transform:uppercase;color:#01557A;
                white-space:nowrap;">Head</div>
            </td>` : ''}
          </tr>
          </table>
        </td>
      </tr>`;
  }).join('');

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'JWMJ Event Management'}" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@jwmj.org'}>`,
    to: headRegistration.memberEmail,
    subject: `Registration Confirmed – ${event.title}`,
    attachments: [
      { filename: 'logo.png', path: path.join(process.cwd(), 'public', 'logo.png'), cid: 'logo_main' },
      { filename: 'logo_jwmyo.jpg', path: path.join(process.cwd(), 'public', 'logo_jwmyo.jpg'), cid: 'logo_jwmyo' },
    ],
    html: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${event.title}</title>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
  body{margin:0!important;padding:0!important;background-color:#EBF2F7}
  .ExternalClass{width:100%}
  .ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,
  .ExternalClass td,.ExternalClass div{line-height:100%}
</style>
</head>
<body style="margin:0;padding:0;background-color:#EBF2F7;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background-color:#EBF2F7;">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
  style="background:#ffffff;border-radius:18px;overflow:hidden;
         box-shadow:0 2px 8px rgba(0,0,0,0.08),0 16px 48px rgba(3,85,122,0.12);
         max-width:600px;width:100%;">

  <!-- LOGOS -->
  <tr>
    <td style="background:#ffffff;padding:32px 40px 22px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="vertical-align:middle;text-align:center;">
          <img src="cid:logo_main" width="72" height="72" alt="JWMJ"
            style="display:block;width:72px;height:72px;">
          <div style="font-family:Arial,sans-serif;font-size:8px;font-weight:700;
            letter-spacing:1.5px;text-transform:uppercase;color:#9CB5C8;margin-top:5px;">JWMJ</div>
        </td>
        <td style="padding:0 22px;vertical-align:middle;">
          <div style="width:1px;height:50px;background:#C0D8E8;margin:0 auto;"></div>
        </td>
        <td style="vertical-align:middle;text-align:center;">
          <img src="cid:logo_jwmyo" width="110" height="72" alt="JWMYO"
            style="display:block;width:110px;height:72px;object-fit:contain;">
          <div style="font-family:Arial,sans-serif;font-size:8px;font-weight:700;
            letter-spacing:1.5px;text-transform:uppercase;color:#9CB5C8;margin-top:5px;">JWMYO</div>
        </td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- ACCENT LINE -->
  <tr>
    <td style="padding:0;font-size:0;line-height:0;background:linear-gradient(to right,#03BDCD,#038DCD,#01557A);height:3px;">&nbsp;</td>
  </tr>

  <!-- TITLE -->
  <tr>
    <td style="background:#F6FAFD;padding:26px 40px 22px;text-align:center;border-bottom:1px solid #E4EEF5;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px;">
      <tr>
        <td style="background:#E5F6EE;border-radius:20px;padding:5px 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:7px;height:7px;background:#0A8554;border-radius:50%;vertical-align:middle;"></td>
            <td style="padding-left:7px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;
              letter-spacing:1.5px;text-transform:uppercase;color:#0A8554;vertical-align:middle;">
              Registration Confirmed</td>
          </tr>
          </table>
        </td>
      </tr>
      </table>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;
        color:#0D2B3E;line-height:1.2;margin-bottom:8px;">${event.title}</div>
      <div style="font-family:Arial,sans-serif;font-size:13px;color:#7A9BB0;">
        Jamnagar Wehvaria Memon Jamat</div>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="padding:28px 40px 0;">

      <!-- Greeting -->
      <p style="font-family:Arial,sans-serif;font-size:15px;color:#4A6070;line-height:1.75;margin:0 0 24px;">
        Assalamu Alaikum <strong style="color:#0D2B3E;">${headRegistration.memberName}</strong>,<br><br>
        We are delighted to confirm your registration for
        <strong style="color:#038DCD;">${event.title}</strong>.
        We look forward to welcoming you and your family to this special community celebration.
      </p>

      <!-- REG ID CARD -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0D2B3E;border-radius:14px;margin-bottom:28px;overflow:hidden;">
      <tr><td style="padding:20px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <div style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;
              letter-spacing:2px;text-transform:uppercase;color:#5A8FA8;margin-bottom:6px;">
              Registration ID</div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;
              font-weight:700;color:#ffffff;letter-spacing:0.5px;line-height:1.2;">
              ${headRegistration.groupId}</div>
          </td>
          <td width="120" style="vertical-align:middle;text-align:center;padding-left:14px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"
              style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
              border-radius:10px;margin-left:auto;">
            <tr><td style="padding:10px 12px;text-align:center;">
              <div style="font-size:20px;margin-bottom:4px;">🎫</div>
              <div style="font-family:Arial,sans-serif;font-size:10px;
                color:rgba(255,255,255,0.55);line-height:1.4;">Show at entrance<br>on event day</div>
            </td></tr>
            </table>
          </td>
        </tr>
        </table>
      </td></tr>
      </table>

      <!-- EVENT DETAILS SECTION LABEL -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:2.5px;
          text-transform:uppercase;color:#038DCD;white-space:nowrap;padding-right:12px;vertical-align:middle;">
          Event Details</td>
        <td style="border-top:1px solid #E2EEF5;vertical-align:middle;width:100%;"></td>
      </tr>
      </table>

      <!-- EVENT DETAIL ROWS -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#F6FAFD;border:1px solid #E0EDF5;border-radius:12px;overflow:hidden;margin-bottom:28px;">

        <tr><td style="padding:13px 18px;border-bottom:1px solid #EDF4FA;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-size:17px;vertical-align:middle;padding-right:12px;">🗓️</td>
            <td><div style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;
              letter-spacing:1px;text-transform:uppercase;color:#90ABBE;margin-bottom:2px;">Date</div>
              <div style="font-family:Arial,sans-serif;font-size:13.5px;font-weight:600;color:#1A3547;">
              ${eventDate}</div></td>
          </tr></table>
        </td></tr>

        ${event.time || event.islamicDate ? `
        <tr><td style="padding:0;border-bottom:1px solid #EDF4FA;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            ${event.time ? `
            <td width="50%" style="padding:13px 18px;border-right:1px solid #EDF4FA;vertical-align:top;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="font-size:17px;vertical-align:middle;padding-right:11px;">⏰</td>
                <td><div style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;
                  letter-spacing:1px;text-transform:uppercase;color:#90ABBE;margin-bottom:2px;">Time</div>
                  <div style="font-family:Arial,sans-serif;font-size:13.5px;font-weight:600;color:#1A3547;">
                  ${event.time}</div></td>
              </tr></table>
            </td>` : ''}
            ${event.islamicDate ? `
            <td width="50%" style="padding:13px 18px;vertical-align:top;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="font-size:17px;vertical-align:middle;padding-right:11px;">☪️</td>
                <td><div style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;
                  letter-spacing:1px;text-transform:uppercase;color:#90ABBE;margin-bottom:2px;">Islamic Date</div>
                  <div style="font-family:Arial,sans-serif;font-size:13.5px;font-weight:600;color:#1A3547;">
                  ${event.islamicDate}</div></td>
              </tr></table>
            </td>` : ''}
          </tr></table>
        </td></tr>` : ''}

        ${event.venue ? `
        <tr><td style="padding:13px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-size:17px;vertical-align:middle;padding-right:12px;">📍</td>
            <td><div style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;
              letter-spacing:1px;text-transform:uppercase;color:#90ABBE;margin-bottom:2px;">Venue</div>
              <div style="font-family:Arial,sans-serif;font-size:13.5px;font-weight:600;color:#1A3547;">
              ${event.venue}</div></td>
          </tr></table>
        </td></tr>` : ''}

      </table>

      <!-- ATTENDEES SECTION LABEL -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:2.5px;
          text-transform:uppercase;color:#038DCD;white-space:nowrap;padding-right:12px;vertical-align:middle;">
          Registered Attendees (${totalAttendees})</td>
        <td style="border-top:1px solid #E2EEF5;vertical-align:middle;width:100%;"></td>
      </tr>
      </table>

      <!-- ATTENDEES LIST -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid #E0EDF5;border-radius:12px;overflow:hidden;margin-bottom:28px;">
        ${attendeeRows}
      </table>

      ${event.desc ? `
      <!-- ABOUT SECTION LABEL -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:2.5px;
          text-transform:uppercase;color:#038DCD;white-space:nowrap;padding-right:12px;vertical-align:middle;">
          About This Event</td>
        <td style="border-top:1px solid #E2EEF5;vertical-align:middle;width:100%;"></td>
      </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border-left:3px solid #038DCD;background:#F6FAFD;border-radius:0 10px 10px 0;margin-bottom:28px;">
      <tr><td style="padding:15px 18px;font-family:Arial,sans-serif;font-size:13.5px;
        color:#4A6070;line-height:1.7;">${event.desc.replace(/\n/g, '<br>')}</td></tr>
      </table>` : ''}

      <!-- REMINDER -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#FFFBEF;border:1px solid #EEC94A;border-radius:12px;margin-bottom:28px;">
      <tr><td style="padding:16px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:20px;vertical-align:top;padding-right:13px;padding-top:1px;">📌</td>
          <td style="font-family:Arial,sans-serif;font-size:13.5px;color:#7A5F00;line-height:1.55;">
            Please bring this email or quote your
            <strong style="color:#5A4000;">Registration ID (${headRegistration.groupId})</strong>
            when checking in at the entrance.
          </td>
        </tr></table>
      </td></tr>
      </table>

      <!-- CLOSING -->
      <p style="font-family:Arial,sans-serif;font-size:14px;color:#4A6070;line-height:1.7;margin:0 0 14px;">
        We look forward to seeing you. If you have any questions, please don't hesitate to reach out to us.
      </p>
      <p style="font-family:Arial,sans-serif;font-size:14px;color:#4A6070;margin:0 0 4px;">Warm regards,</p>
      <p style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#0D2B3E;margin:0 0 3px;">
        Event Management Committee</p>
      <p style="font-family:Arial,sans-serif;font-size:12.5px;color:#90ABBE;margin:0 0 32px;">
        Jamnagar Wehvaria Memon Jamat</p>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#F2F8FC;border-top:1px solid #DDE9F2;padding:22px 40px 26px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;">
      <tr>
        <td style="vertical-align:middle;padding-right:14px;">
          <img src="cid:logo_main" width="30" height="30" alt="JWMJ"
            style="display:block;opacity:0.6;">
        </td>
        <td style="vertical-align:middle;padding-right:14px;">
          <div style="width:1px;height:22px;background:#C0D4E0;"></div>
        </td>
        <td style="vertical-align:middle;">
          <img src="cid:logo_jwmyo" width="48" height="30" alt="JWMYO"
            style="display:block;opacity:0.6;">
        </td>
      </tr>
      </table>
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#7A9BB0;margin:0 0 10px;line-height:1.8;">
        📞 +92 21 34893375 &nbsp;·&nbsp; 📱 +92 300 9253888 &nbsp;·&nbsp;
        📧 info@jwmj.org &nbsp;·&nbsp; 🌐 www.jwmj.org
      </p>
      <p style="font-family:Arial,sans-serif;font-size:11px;color:#A8BED0;margin:0;line-height:1.7;">
        &copy; ${new Date().getFullYear()} Jamnagar Wehvaria Memon Jamat. All rights reserved.<br>
        This is an automated message — please do not reply to this email.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`,

    text: `
Assalamu Alaikum ${headRegistration.memberName},

Registration confirmed for: ${event.title}
Registration ID: ${headRegistration.groupId}

EVENT DETAILS
─────────────
Date:    ${eventDate}
${event.time ? `Time:    ${event.time}\n` : ''}${event.islamicDate ? `Islamic: ${event.islamicDate}\n` : ''}${event.venue ? `Venue:   ${event.venue}\n` : ''}
ATTENDEES (${totalAttendees})
─────────────
${allRegistrations.map(r => `• ${r.memberName}${r.isHead ? ' (Head)' : ''}`).join('\n')}

Please present your Registration ID (${headRegistration.groupId}) at the entrance.

Warm regards,
Event Management Committee — Jamnagar Wehvaria Memon Jamat
📞 +92 21 34893375 | 📧 info@jwmj.org | 🌐 www.jwmj.org
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending invitation:', error);
    throw error;
  }
}