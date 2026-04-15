import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCompletedOrders } from '@/lib/ecwid'
import { sendReviewRequest } from '@/lib/email'

// POST: 리뷰 요청 이메일 발송 (수동 or 자동)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { storeId, orderId } = body

  if (!storeId) return NextResponse.json({ error: 'Missing storeId' }, { status: 400 })

  const store = await prisma.store.findUnique({ where: { storeId } })
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  // 특정 주문 지정 없으면 최근 주문 자동 처리
  if (!orderId) {
    const ordersData = await getCompletedOrders(storeId, store.accessToken, 20)
    const orders = ordersData.items ?? []
    let sent = 0

    for (const order of orders) {
      for (const item of order.items) {
        const existing = await prisma.reviewRequest.findFirst({
          where: { storeId, orderId: String(order.id), productId: String(item.productId) },
        })
        if (existing) continue

        // Free: 월 50건 제한
        if (store.plan === 'free') {
          const thisMonth = new Date()
          thisMonth.setDate(1)
          thisMonth.setHours(0, 0, 0, 0)
          const count = await prisma.reviewRequest.count({
            where: { storeId, sentAt: { gte: thisMonth } },
          })
          if (count >= 50) break
        }

        const request = await prisma.reviewRequest.create({
          data: {
            storeId,
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

        sent++
      }
    }

    return NextResponse.json({ sent })
  }

  return NextResponse.json({ sent: 0 })
}
