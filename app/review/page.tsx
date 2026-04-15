'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="text-3xl leading-none"
          style={{ color: i <= (hover || value) ? '#f59e0b' : '#d1d5db' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ReviewPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [productName, setProductName] = useState('')

  useEffect(() => {
    // 토큰으로 상품명 조회
    if (!token) return
    fetch(`/api/reviews/meta?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.productName) setProductName(d.productName) })
      .catch(() => {})
  }, [token])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setError('Please select a star rating'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, title, body }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Something went wrong')
        return
      }
      setDone(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-white">
        <p className="text-gray-500 text-sm">Invalid review link.</p>
      </main>
    )
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-white">
        <div className="text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <h1 className="text-xl font-semibold text-gray-900">Thank you!</h1>
          <p className="text-sm text-gray-500">Your review has been submitted. We appreciate your feedback!</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl border p-8 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leave a Review</h1>
          {productName && <p className="text-sm text-gray-500 mt-1">{productName}</p>}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-2">Your Rating <span className="text-red-500">*</span></label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Review Title <span className="text-gray-400">(optional)</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Your Review <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="What did you like or dislike? What did you use it for?"
              rows={4}
              maxLength={2000}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !rating}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </main>
  )
}
