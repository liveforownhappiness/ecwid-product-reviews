import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ecwidFetch } from '@/lib/ecwid'
import { sendReviewRequest } from '@/lib/email'

// Ecwid order webhook
// 주문 상태가 SHIPPED/DELIVERED로 변경될 때 리뷰 요청 이메일 발송
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { storeId, eventType, entityId } = body

  if (!storeId || !entityId) return NextResponse.json({ ok: true })

  // 주문 완료/배송 이벤트만 처리
  const relevantEvents = ['order.updated', 'order.created']
  if (!relevantEvents.includes(eventType)) return NextResponse.json({ ok: true })

  const store = await prisma.store.findUnique({ where: { storeId: String(storeId) } })
  if (!store || !store.autoRequest) return NextResponse.json({ ok: true })

  try {
    const order = await ecwidFetch<{
      id: number
      paymentStatus: string
      fulfillmentStatus: string
      email: string
      billingPerson: { name: string }
      items: Array<{ productId: number; name: string }>
    }>(String(storeId), store.accessToken, `/orders/${entityId}`)

    // DELIVERED 또는 SHIPPED 상태일 때만 처리
    if (!['DELIVERED', 'SHIPPED'].includes(order.fulfillmentStatus)) {
      return NextResponse.json({ ok: true })
    }
    if (order.paymentStatus !== 'PAID') return NextResponse.json({ ok: true })

    // Free 플랜: 월 50건 제한
    if (store.plan === 'free') {
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      const count = await prisma.reviewRequest.count({
        where: { storeId: String(storeId), sentAt: { gte: thisMonth } },
      })
      if (count >= 50) return NextResponse.json({ ok: true, skipped: 'free_limit' })
    }

    for (const item of order.items) {
      const existing = await prisma.reviewRequest.findFirst({
        where: {
          storeId: String(storeId),
          orderId: String(order.id),
          productId: String(item.productId),
        },
      })
      if (existing) continue

      const request = await prisma.reviewRequest.create({
        data: {
          storeId: String(storeId),
          orderId: String(order.id),
          customerEmail: order.email,
          customerName: order.billingPerson?.name ?? 'Customer',
          productId: String(item.productId),
          productName: item.name,
          sentAt: new Date(),
        },
      })

      await sendReviewRequest({
        to: order.email,
        customerName: order.billingPerson?.name ?? 'Customer',
        productName: item.name,
        storeName: `Store #${storeId}`,
        token: request.token,
      })
    }
  } catch (err) {
    console.error('Webhook error:', err)
  }

  return NextResponse.json({ ok: true })
}
