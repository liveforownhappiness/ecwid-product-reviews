import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: 스토어의 리뷰 목록 (대시보드) or 상품별 리뷰 (위젯)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const storeId = searchParams.get('store_id')
  const productId = searchParams.get('product_id')

  if (!storeId) return NextResponse.json({ error: 'Missing store_id' }, { status: 400 })

  const where = {
    storeId,
    ...(productId ? { productId } : {}),
    ...(productId ? { status: 'approved' } : {}),  // 위젯은 승인된 것만
  }

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: productId ? 50 : 200,
  })

  // 상품별 평균 평점
  let avgRating: number | null = null
  if (productId) {
    const agg = await prisma.review.aggregate({
      where: { storeId, productId, status: 'approved' },
      _avg: { rating: true },
      _count: true,
    })
    avgRating = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null
    return NextResponse.json({ reviews, avgRating, count: agg._count })
  }

  const store = await prisma.store.findUnique({ where: { storeId } })
  return NextResponse.json({ reviews, plan: store?.plan ?? 'free' })
}

// POST: 리뷰 제출 (고객)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, rating, title, body: reviewBody } = body

  if (!token || !rating) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const request = await prisma.reviewRequest.findUnique({ where: { token } })
  if (!request) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  if (request.completedAt) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

  const review = await prisma.review.create({
    data: {
      storeId: request.storeId,
      productId: request.productId,
      productName: request.productName,
      orderId: request.orderId,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title?.slice(0, 100) || null,
      body: reviewBody?.slice(0, 2000) || null,
      status: 'approved',  // 기본 바로 승인 (Pro: pending → 머천트 검토)
    },
  })

  await prisma.reviewRequest.update({
    where: { token },
    data: { completedAt: new Date() },
  })

  return NextResponse.json({ review })
}

// PATCH: 리뷰 상태 변경 (머천트 — 승인/거부)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, storeId, status } = body

  if (!id || !storeId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const review = await prisma.review.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ review })
}
