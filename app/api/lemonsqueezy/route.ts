import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/db'

// LemonSqueezy webhook 처리
// subscription_created / subscription_updated / subscription_cancelled / subscription_expired
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  // HMAC 서명 검증
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'No webhook secret' }, { status: 500 })

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload?.meta?.event_name as string
  const storeId = payload?.meta?.custom_data?.store_id as string
  const status = payload?.data?.attributes?.status as string

  if (!storeId) return NextResponse.json({ ok: true })

  try {
    if (['subscription_created', 'subscription_updated'].includes(eventName)) {
      const plan = status === 'active' ? 'pro' : 'free'
      await prisma.store.update({ where: { storeId }, data: { plan } })
    }

    if (['subscription_cancelled', 'subscription_expired'].includes(eventName)) {
      await prisma.store.update({ where: { storeId }, data: { plan: 'free' } })
    }
  } catch (err) {
    console.error('LemonSqueezy webhook error:', err)
  }

  return NextResponse.json({ ok: true })
}
