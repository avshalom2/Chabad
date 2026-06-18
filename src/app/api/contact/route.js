export const runtime = 'nodejs';

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_TO_EMAIL = 'avsha12@gmail.com';
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Email service is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const name = normalizeText(body.name, 120);
    const email = normalizeText(body.email, 180).toLowerCase();
    const phone = normalizeText(body.phone, 80);
    const subject = normalizeText(body.subject, 160) || 'פנייה חדשה מהאתר';
    const message = normalizeText(body.message, 4000);
    const company = normalizeText(body.company, 120);
    const articleTitle = normalizeText(body.articleTitle, 240);

    if (company) {
      return Response.json({ success: true });
    }

    if (!name || !email || !message) {
      return Response.json({ error: 'Name, email and message are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const toEmail = process.env.CONTACT_FORM_TO_EMAIL || DEFAULT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    const safeSubject = `Contact form: ${subject}`;

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin: 0 0 16px;">פנייה חדשה מהאתר</h2>
        <p><strong>שם:</strong> ${escapeHtml(name)}</p>
        <p><strong>אימייל:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>טלפון:</strong> ${escapeHtml(phone)}</p>` : ''}
        <p><strong>נושא:</strong> ${escapeHtml(subject)}</p>
        ${articleTitle ? `<p><strong>כתבה:</strong> ${escapeHtml(articleTitle)}</p>` : ''}
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #e5e7eb;">
          ${escapeHtml(message).replace(/\n/g, '<br />')}
        </div>
      </div>
    `;

    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Chabad Website <${fromEmail}>`,
        to: [toEmail],
        subject: safeSubject,
        html,
        reply_to: email,
      }),
    });

    const result = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      console.error('Resend contact email error:', result);
      return Response.json({ error: 'Failed to send email' }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
