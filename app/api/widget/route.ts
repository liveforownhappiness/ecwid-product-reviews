import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ecwid-product-reviews.vercel.app'

// GET /api/widget?store_id=xxx
// Ecwid 상품 페이지에 삽입되는 리뷰 위젯 JS
export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get('store_id')
  if (!storeId) {
    return new NextResponse('// Missing store_id', { headers: { 'Content-Type': 'application/javascript' } })
  }

  const store = await prisma.store.findUnique({ where: { storeId } })
  if (!store) {
    return new NextResponse('// Store not found', { headers: { 'Content-Type': 'application/javascript' } })
  }

  const script = `
(function() {
  var API = '${APP_URL}/api/reviews';
  var STORE_ID = '${storeId}';

  function stars(rating, interactive) {
    return [1,2,3,4,5].map(function(i) {
      var filled = i <= rating;
      return '<span style="color:' + (filled ? '#f59e0b' : '#d1d5db') + ';font-size:18px;cursor:' + (interactive ? 'pointer' : 'default') + '" data-star="' + i + '">&#9733;</span>';
    }).join('');
  }

  function renderWidget(productId, container) {
    fetch(API + '?store_id=' + STORE_ID + '&product_id=' + productId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var reviews = data.reviews || [];
        var avg = data.avgRating;
        var count = data.count || 0;

        var html = '<div id="pr-widget" style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
        html += '<h3 style="font-size:16px;font-weight:600;margin:0;color:#111827">Customer Reviews</h3>';
        if (avg) {
          html += '<span style="display:flex;align-items:center;gap:4px">' + stars(Math.round(avg), false) + '</span>';
          html += '<span style="font-size:14px;color:#6b7280">' + avg + ' / 5 (' + count + ' reviews)</span>';
        }
        html += '</div>';

        if (reviews.length === 0) {
          html += '<p style="color:#9ca3af;font-size:14px">No reviews yet. Be the first!</p>';
        } else {
          reviews.forEach(function(r) {
            html += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
            html += '<span>' + stars(r.rating, false) + '</span>';
            if (r.title) html += '<strong style="font-size:14px;color:#111827">' + r.title + '</strong>';
            html += '</div>';
            if (r.body) html += '<p style="font-size:14px;color:#374151;margin:0 0 8px;line-height:1.6">' + r.body + '</p>';
            html += '<p style="font-size:12px;color:#9ca3af;margin:0">' + r.customerName + ' &middot; ' + new Date(r.createdAt).toLocaleDateString() + '</p>';
            html += '</div>';
          });
        }
        html += '</div>';

        container.innerHTML = html;
      })
      .catch(function() {});
  }

  function init() {
    if (typeof Ecwid === 'undefined') return;
    Ecwid.OnPageLoaded.add(function(page) {
      if (page.type !== 'PRODUCT') return;
      var productId = page.productId;
      setTimeout(function() {
        var target = document.querySelector('.ec-page-body') || document.querySelector('.ecwid-Product') || document.body;
        var wrap = document.createElement('div');
        wrap.id = 'pr-reviews-wrap';
        target.appendChild(wrap);
        renderWidget(productId, wrap);
      }, 800);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`.trim()

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
