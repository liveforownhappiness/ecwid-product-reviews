import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/db'

const PRO_EVENTS = ['subscription_created', 'subscription_updated', 'subscription_resumed', 'subscription_unpaused']
const FREE_EVENTS = ['subscription_cancelled', 'subscription_expired', 'subscription_paused', 'subscription_payment_failed']

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

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
    if (PRO_EVENTS.includes(eventName)) {
      const plan = status === 'active' ? 'pro' : 'free'
      await prisma.store.update({ where: { storeId }, data: { plan } })
    } else if (FREE_EVENTS.includes(eventName)) {
      await prisma.store.update({ where: { storeId }, data: { plan: 'free' } })
    }
  } catch (err) {
    console.error('LemonSqueezy webhook error:', err)
  }

  return NextResponse.json({ ok: true })
}
