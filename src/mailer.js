const { Resend } = require("resend");

// ─── Client ───────────────────────────────────────────────────────────────────

// Resend uses an HTTP API — no SMTP ports needed, works everywhere including
// Render.com which blocks outbound SMTP (ports 25, 465, 587).
const resend = new Resend(process.env.RESEND_API_KEY);

// Warn at startup if the API key is missing.
if (!process.env.RESEND_API_KEY) {
  console.error("❌  RESEND_API_KEY is not set — emails will fail.");
} else {
  console.log("✅  Resend client initialised — ready to send emails.");
}


// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * HTML email sent to Kanhaiya when someone fills the contact form.
 */
function buildNotificationEmail({ name, email, message }) {
  return {
    from: process.env.RESEND_FROM_EMAIL,
    to: [process.env.EMAIL_TO],
    reply_to: email,
    subject: `📬 New message from ${name} — Portfolio Contact`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Contact Message</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f1eb;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0d9cc;border-radius:2px;overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td style="background:#1a1208;padding:28px 36px;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#c0392b;text-transform:uppercase;">PORTFOLIO / CONTACT FORM</p>
                    <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">New Message Received</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px;">

                    <!-- Sender info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="padding:14px 16px;background:#f4f1eb;border-left:3px solid #c0392b;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;color:#c0392b;text-transform:uppercase;">From</p>
                          <p style="margin:0;font-size:16px;font-weight:700;color:#1a1208;">${name}</p>
                          <a href="mailto:${email}" style="font-size:13px;color:#1a1208;opacity:0.7;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Message -->
                    <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:2px;color:#c0392b;text-transform:uppercase;">Message</p>
                    <div style="background:#f4f1eb;border-left:3px solid #1a1208;padding:16px 20px;border-radius:1px;">
                      <p style="margin:0;font-size:15px;color:#1a1208;line-height:1.7;white-space:pre-wrap;">${message}</p>
                    </div>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                      <tr>
                        <td>
                          <a href="mailto:${email}?subject=Re: Your message to Kanhaiya Yadav"
                             style="display:inline-block;padding:12px 28px;background:#1a1208;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;border-radius:1px;">
                            Reply to ${name}
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:18px 36px;border-top:1px solid #e0d9cc;background:#faf8f4;">
                    <p style="margin:0;font-size:11px;color:#1a1208;opacity:0.5;">
                      This email was sent automatically via your portfolio contact form at kanhaiyadav.me
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
}

/**
 * Auto-reply sent to the person who submitted the form.
 */
function buildAutoReplyEmail({ name, email }) {
  return {
    from: process.env.RESEND_FROM_EMAIL,
    to: [email],
    subject: `Got your message, ${name}! — Kanhaiya Yadav`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Message Received</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f1eb;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0d9cc;border-radius:2px;overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td style="background:#1a1208;padding:28px 36px;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#c0392b;text-transform:uppercase;">KANHAIYA YADAV / PORTFOLIO</p>
                    <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Message received!</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px;">
                    <p style="margin:0 0 16px;font-size:15px;color:#1a1208;line-height:1.7;">
                      Hey <strong>${name}</strong>,
                    </p>
                    <p style="margin:0 0 16px;font-size:15px;color:#1a1208;line-height:1.7;">
                      Thanks for reaching out! I've received your message and will get back to you as soon as possible — usually within 24–48 hours.
                    </p>
                    <p style="margin:0 0 32px;font-size:15px;color:#1a1208;line-height:1.7;">
                      In the meantime, feel free to check out my work or connect with me on LinkedIn.
                    </p>

                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <a href="https://kanhaiyadav.me"
                             style="display:inline-block;padding:12px 24px;background:#1a1208;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;border-radius:1px;">
                            View Portfolio
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:36px 0 0;font-size:14px;color:#1a1208;opacity:0.8;line-height:1.6;">
                      Cheers,<br />
                      <strong>Kanhaiya Yadav</strong><br />
                      <span style="font-size:12px;opacity:0.6;">Full-Stack Developer</span>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:18px 36px;border-top:1px solid #e0d9cc;background:#faf8f4;">
                    <p style="margin:0;font-size:11px;color:#1a1208;opacity:0.5;">
                      You're receiving this because you submitted the contact form at kanhaiyadav.me
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
}

// ─── Send Function ────────────────────────────────────────────────────────────

/**
 * Send both the notification email (to Kanhaiya) and the auto-reply (to sender).
 * @param {{ name: string, email: string, message: string }} data
 */
async function sendContactEmail(data) {
  const [notification, autoReply] = await Promise.all([
    resend.emails.send(buildNotificationEmail(data)),
    resend.emails.send(buildAutoReplyEmail(data)),
  ]);

  // Resend returns errors as values rather than throwing — surface them.
  if (notification.error) throw new Error(notification.error.message);
  if (autoReply.error) throw new Error(autoReply.error.message);
}

module.exports = { sendContactEmail };
