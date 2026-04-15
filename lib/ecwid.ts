const ECWID_API = 'https://app.ecwid.com/api/v3'
const ECWID_TOKEN_URL = 'https://my.ecwid.com/api/oauth/token'

export async function exchangeToken(code: string): Promise<{
  access_token: string
  store_id: number
}> {
  const params = new URLSearchParams({
    client_id: process.env.ECWID_CLIENT_ID!,
    client_secret: process.env.ECWID_CLIENT_SECRET!,
    code,
    redirect_uri: process.env.ECWID_REDIRECT_URI!,
    grant_type: 'authorization_code',
  })

  const res = await fetch(ECWID_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`)
  return res.json()
}

export async function ecwidFetch<T = unknown>(
  storeId: string,
  token: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${ECWID_API}/${storeId}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Ecwid API error: ${res.status} on ${path}`)
  return res.json() as Promise<T>
}

// 최근 완료된 주문 목록
export async function getCompletedOrders(storeId: string, token: string, limit = 20) {
  return ecwidFetch<{
    total: number
    items: Array<{
      id: number
      orderNumber: string
      paymentStatus: string
      fulfillmentStatus: string
      email: string
      billingPerson: { name: string }
      items: Array<{ productId: number; name: string }>
      createDate: string
    }>
  }>(storeId, token, `/orders?paymentStatus=PAID&limit=${limit}&sortBy=UPDATED_DATE_DESC`)
}
