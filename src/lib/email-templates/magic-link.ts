interface MagicLinkTemplateData {
  magicLinkUrl: string;
  supportEmail: string;
  companyName: string;
}

export function buildMagicLinkEmailText({
  magicLinkUrl,
  supportEmail,
  companyName,
}: MagicLinkTemplateData): string {
  return `Use this secure link to access your bookings:\n${magicLinkUrl}\n\nThis link expires in 15 minutes. If you did not request it, you can ignore this email.\n\nNeed help? Reply to this email or contact ${supportEmail}.\n\n${companyName}`;
}

export function buildMagicLinkEmailHtml({
  magicLinkUrl,
  supportEmail,
  companyName,
}: MagicLinkTemplateData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Access your bookings</h2>
      <p>Click the button below to securely access your bookings. This link expires in 15 minutes.</p>
      <p style="margin: 24px 0;">
        <a href="${magicLinkUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View My Bookings
        </a>
      </p>
      <p>If you did not request this link, you can ignore this email.</p>
      <p>Need help? Contact us at ${supportEmail}.</p>
      <p>${companyName}</p>
    </div>
  `;
}
