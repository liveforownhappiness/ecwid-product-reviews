import { Resend } from 'resend'

// 빌드 타임이 아닌 런타임에 초기화
function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ecwid-product-reviews.vercel.app'

export async function sendReviewRequest({
  to,
  customerName,
  productName,
  storeName,
  token,
}: {
  to: string
  customerName: string
  productName: string
  storeName: string
  token: string
}) {
  const reviewUrl = `${APP_URL}/review?token=${token}`

  await getResend().emails.send({
    from: 'liveforownhappiness@liveforownhappiness.com',
    to,
    subject: `How was your ${productName}?`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="font-size:18px;font-weight:600;color:#111827;margin:0 0 8px">How was your purchase?</h2>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
      Hi ${customerName}, thank you for your order from <strong>${storeName}</strong>!<br>
      We'd love to hear your feedback on <strong>${productName}</strong>.
    </p>
    <div style="text-align:center;margin:0 0 24px">
      <a href="${reviewUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
        Leave a Review
      </a>
    </div>
    <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center">
      It only takes 30 seconds. Your feedback helps other shoppers!
    </p>
  </div>
</body>
</html>`,
  })
}
