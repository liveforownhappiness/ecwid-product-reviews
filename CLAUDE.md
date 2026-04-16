@AGENTS.md

# ecwid-product-reviews — 프로젝트 메모

**Vercel URL**: https://ecwid-product-reviews.vercel.app  
**GitHub**: https://github.com/liveforownhappiness/ecwid-product-reviews

---

## 환경변수 (Vercel Production 설정 완료)

| 변수 | 상태 |
|---|---|
| `DATABASE_URL` | ✅ Neon PostgreSQL |
| `ECWID_REDIRECT_URI` | ✅ .../api/oauth/callback |
| `RESEND_API_KEY` | ✅ re_DsKPcwDZ_... (shopify-back-in-stock에서 공유) |
| `NEXT_PUBLIC_APP_URL` | ✅ https://ecwid-product-reviews.vercel.app |
| `ECWID_CLIENT_ID` | ⬜ Ecwid 팀 응답 후 추가 |
| `ECWID_CLIENT_SECRET` | ⬜ Ecwid 팀 응답 후 추가 |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | ✅ Vercel Production 설정 완료 (2026-04-16) |

---

## LemonSqueezy (결제) — Live mode ✅

| 항목 | 값 |
|---|---|
| 상품명 | Ecwid Product Reviews Pro |
| 가격 | $7.99/월 |
| Variant ID | **1537035** |
| Checkout URL | `https://50x10.lemonsqueezy.com/checkout/buy/544fd2e9-54e9-4bdb-a82b-e717efa0a899` |
| Webhook URL | `https://ecwid-product-reviews.vercel.app/api/lemonsqueezy` |

---

## 앱 구조

- `app/review/page.tsx` — 고객이 이메일 링크 클릭 시 보는 리뷰 작성 폼
- `app/dashboard/page.tsx` — 머천트 대시보드 (리뷰 목록, 승인/거부, 요청 발송)
- `app/api/reviews/` — GET(목록), POST(제출), PATCH(상태변경)
- `app/api/reviews/meta/` — 토큰으로 상품명 조회 (리뷰 폼용)
- `app/api/widget/` — **핵심** Ecwid 상품 페이지에 삽입되는 리뷰 위젯 JS
- `app/api/webhook/` — Ecwid 주문 webhook (배송완료 시 이메일 자동 발송)
- `app/api/request/` — 수동 리뷰 요청 발송
- `app/api/oauth/callback/` — OAuth 인증

---

## 핵심 아키텍처

**위젯**: `/api/widget?store_id=xxx` → Ecwid 상품 페이지에 리뷰 렌더링  
머천트가 스토어 Custom JS에 삽입:
```html
<script src="https://ecwid-product-reviews.vercel.app/api/widget?store_id=STORE_ID" defer></script>
```

**이메일 플로우**: 주문 webhook → Resend로 리뷰 요청 이메일 → 고객 클릭 → /review?token=xxx → 제출

---

## 가격

- Free: 월 50건 이메일, 위젯 기본 표시
- Pro $7.99/월: 무제한 이메일, 자동 발송 지연 설정, 사진 리뷰, 리뷰 답글

---

## 개발 주의사항

- git commit 시 `liveforownhappiness@gmail.com` 계정 사용
- Resend 발신자: `reviews@liveforownhappiness.com` (도메인 인증 필요)
- Prisma 7: `prisma.config.ts`에서 datasource url 관리
