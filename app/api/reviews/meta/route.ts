import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/reviews/meta?token=xxx — 리뷰 작성 페이지에서 상품명 조회
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const request = await prisma.reviewRequest.findUnique({ where: { token } })
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ productName: request.productName })
}
