'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Review {
  id: string
  productName: string
  customerName: string
  rating: number
  title: string | null
  body: string | null
  status: string
  createdAt: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  )
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store_id') ?? ''

  const [reviews, setReviews] = useState<Review[]>([])
  const [plan, setPlan] = useState('free')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      window.parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*')
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!storeId) return
    fetch(`/api/reviews?store_id=${storeId}`)
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews ?? [])
        setPlan(d.plan ?? 'free')
      })
  }, [storeId])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, storeId, status }),
    })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  async function sendRequests() {
    setSending(true)
    setSendResult('')
    const res = await fetch('/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId }),
    })
    const data = await res.json()
    setSendResult(`Sent ${data.sent} review request${data.sent !== 1 ? 's' : ''}`)
    setSending(false)
  }

  const approved = reviews.filter(r => r.status === 'approved')
  const pending = reviews.filter(r => r.status === 'pending')
  const snippetUrl = `https://ecwid-product-reviews.vercel.app/api/widget?store_id=${storeId}`
  const snippet = `<script src="${snippetUrl}" defer></script>`

  if (!storeId) {
    return <div className="p-8 text-center text-gray-500">Invalid access. Please install the app from the Ecwid App Market.</div>
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto p-6 space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Product Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Collect and display customer reviews on your product pages.</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">
          {plan === 'pro' ? 'Pro' : 'Free'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length },
          { label: 'Approved', value: approved.length },
          { label: 'Pending', value: pending.length },
        ].map(s => (
          <div key={s.label} className="border rounded p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Send Review Requests */}
      <section className="border rounded p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-800">Send Review Requests</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Automatically email customers from recent paid orders.{' '}
              {plan === 'free' && <span className="text-gray-400">Free: 50 emails/month</span>}
            </p>
          </div>
          <button
            onClick={sendRequests}
            disabled={sending}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send Now'}
          </button>
        </div>
        {sendResult && <p className="text-sm text-green-600">{sendResult}</p>}
      </section>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-medium text-gray-800">All Reviews <span className="text-gray-400 font-normal text-sm">({reviews.length})</span></h2>
          <ul className="space-y-3">
            {reviews.map(r => (
              <li key={r.id} className="border rounded p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      {r.title && <span className="text-sm font-medium text-gray-800">{r.title}</span>}
                    </div>
                    {r.body && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                    <p className="text-xs text-gray-400">
                      {r.customerName} · {r.productName} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === 'approved' ? 'bg-green-100 text-green-700' :
                      r.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{r.status}</span>
                    {r.status !== 'approved' && (
                      <button onClick={() => updateStatus(r.id, 'approved')} className="text-xs text-blue-600 hover:underline">Approve</button>
                    )}
                    {r.status !== 'rejected' && (
                      <button onClick={() => updateStatus(r.id, 'rejected')} className="text-xs text-red-400 hover:underline">Reject</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="border rounded p-8 text-center text-gray-400 text-sm">
          No reviews yet. Send review requests to start collecting feedback.
        </section>
      )}

      {/* Widget Install */}
      <section className="border rounded p-5 bg-gray-50 space-y-3">
        <h3 className="font-medium text-gray-800">Display Reviews on Your Store</h3>
        <p className="text-sm text-gray-500">
          Paste this script into your Ecwid store&apos;s custom JavaScript section. Reviews will appear automatically on every product page.
        </p>
        <div className="bg-gray-900 rounded p-3 overflow-x-auto">
          <code className="text-xs text-green-400 whitespace-nowrap">{snippet}</code>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(snippet)}
          className="text-xs text-blue-600 hover:underline"
        >
          Copy to clipboard
        </button>
      </section>

      {/* Upgrade CTA */}
      <section className="border rounded p-5 bg-gray-50 space-y-2">
        <h3 className="font-medium text-gray-800">Upgrade to Pro — $7.99/mo</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Unlimited review request emails (Free: 50/month)</li>
          <li>Automatic requests after every order (set delay: 3, 7, 14 days)</li>
          <li>Review moderation — approve before publishing</li>
          <li>Reply to reviews publicly</li>
          <li>Photo reviews</li>
        </ul>
        <a
          href={`https://50×10.lemonsqueezy.com/checkout/buy/585e1ee7-d753-4f51-a120-2cdb788ad383?checkout[custom][store_id]=${storeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Upgrade to Pro
        </a>
      </section>
    </div>
  )
}
