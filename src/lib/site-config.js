const defaultContactEmail = 'avsha12@gmail.com';
const defaultContactFromEmail = 'onboarding@resend.dev';
const defaultWhatsAppPhone = '0522523430';

function normalizeWhatsAppPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return defaultWhatsAppPhone;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  return digits;
}

export const siteConfig = {
  contact: {
    email: process.env.CONTACT_FORM_TO_EMAIL || defaultContactEmail,
    fromEmail: process.env.CONTACT_FORM_FROM_EMAIL || defaultContactFromEmail,
    phone: process.env.CONTACT_WHATSAPP_PHONE || defaultWhatsAppPhone,
    whatsappPhone: normalizeWhatsAppPhone(process.env.CONTACT_WHATSAPP_PHONE),
  },
};
