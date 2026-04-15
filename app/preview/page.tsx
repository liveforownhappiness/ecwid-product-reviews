// 스크린샷용 프리뷰 페이지

const MOCK_REVIEWS = [
  { id: '1', customerName: 'Sarah M.', productName: 'Wireless Headphones Pro', rating: 5, title: 'Absolutely amazing sound quality!', body: 'I\'ve tried many headphones but these are by far the best. The noise cancellation is incredible and battery life lasts all day. Highly recommend!', status: 'approved', createdAt: '2026-04-10T10:00:00Z' },
  { id: '2', customerName: 'James K.', productName: 'Wireless Headphones Pro', rating: 4, title: 'Great headphones, minor comfort issue', body: 'Sound quality is excellent. The only issue is they get a bit uncomfortable after 3+ hours of wear, but overall very satisfied with the purchase.', status: 'approved', createdAt: '2026-04-08T14:30:00Z' },
  { id: '3', customerName: 'Emily R.', productName: 'Running Shoes X500', rating: 5, title: 'Perfect for marathon training', body: 'Lightweight, responsive, and extremely comfortable. These are my new go-to shoes for all my runs.', status: 'pending', createdAt: '2026-04-12T09:15:00Z' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  )
}

const snippet = `<script src="https://ecwid-product-reviews.vercel.app/api/widget?store_id=12345" defer></script>`

export default function PreviewPage() {
  const approved = MOCK_REVIEWS.filter(r => r.status === 'approved')
  const pending = MOCK_REVIEWS.filter(r => r.status === 'pending')

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Product Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Collect and display customer reviews on your product pages.</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">Free</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: MOCK_REVIEWS.length },
          { label: 'Approved', value: approved.length },
          { label: 'Pending', value: pending.length },
        ].map(s => (
          <div key={s.label} className="border rounded p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Send Requests */}
      <section className="border rounded p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-800">Send Review Requests</h2>
            <p className="text-xs text-gray-500 mt-0.5">Automatically email customers from recent paid orders. Free: 50 emails/month</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Send Now</button>
        </div>
      </section>

      {/* Reviews List */}
      <section className="space-y-3">
        <h2 className="font-medium text-gray-800">All Reviews <span className="text-gray-400 font-normal text-sm">({MOCK_REVIEWS.length})</span></h2>
        <ul className="space-y-3">
          {MOCK_REVIEWS.map(r => (
            <li key={r.id} className="border rounded p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} />
                    {r.title && <span className="text-sm font-medium text-gray-800">{r.title}</span>}
                  </div>
                  {r.body && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                  <p className="text-xs text-gray-400">{r.customerName} · {r.productName} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                  {r.status === 'pending' && <span className="text-xs text-blue-600">Approve</span>}
                  <span className="text-xs text-red-400">Reject</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Widget install */}
      <section className="border rounded p-5 bg-gray-50 space-y-3">
        <h3 className="font-medium text-gray-800">Display Reviews on Your Store</h3>
        <p className="text-sm text-gray-500">Paste this script into your Ecwid store&apos;s custom JavaScript section. Reviews appear automatically on every product page.</p>
        <div className="bg-gray-900 rounded p-3 overflow-x-auto">
          <code className="text-xs text-green-400 whitespace-nowrap">{snippet}</code>
        </div>
      </section>

      {/* Upgrade CTA */}
      <section className="border rounded p-5 bg-gray-50 space-y-2">
        <h3 className="font-medium text-gray-800">Upgrade to Pro — $7.99/mo</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Unlimited review request emails (Free: 50/month)</li>
          <li>Automatic requests after every order (3, 7, 14 day delay)</li>
          <li>Review moderation — approve before publishing</li>
          <li>Reply to reviews publicly</li>
          <li>Photo reviews</li>
        </ul>
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded">Upgrade to Pro</button>
      </section>
    </div>
  )
}
