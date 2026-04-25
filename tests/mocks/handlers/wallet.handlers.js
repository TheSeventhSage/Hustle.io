import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:3000/api'

export const walletHandlers = [
  http.get(`${BASE}/wallet`, () => {
    return HttpResponse.json({
      balance:   25000,
      inEscrow:  5000,
      available: 20000,
      hasPIN:    false,
      currency:  'NGN',
    })
  }),

  http.post(`${BASE}/wallet/pin`, async ({ request }) => {
    const body = await request.json()

    if (body.pin !== body.confirmPin) {
      return HttpResponse.json({ message: 'PINs do not match' }, { status: 400 })
    }

    return HttpResponse.json({ success: true })
  }),

  http.post(`${BASE}/wallet/pin/verify`, async ({ request }) => {
    const { pin } = await request.json()
    return HttpResponse.json({ valid: pin === '1234' })
  }),

  http.post(`${BASE}/wallet/withdraw`, async ({ request }) => {
    const body = await request.json()

    if (body.pin !== '1234') {
      return HttpResponse.json({ message: 'Incorrect PIN' }, { status: 401 })
    }

    return HttpResponse.json({
      success:       true,
      transactionId: 'tx-w-001',
      newBalance:    20000 - body.amount,
    })
  }),

  http.post(`${BASE}/wallet/top-up`, async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success:       true,
      transactionId: 'tx-t-001',
      newBalance:    20000 + body.amount,
    })
  }),

  http.get(`${BASE}/wallet/transactions`, ({ request }) => {
    const url  = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)

    return HttpResponse.json({
      data: [
        {
          id:        'tx-001',
          type:      'credit',
          amount:    5000,
          currency:  'NGN',
          description:'Payment received for hustle',
          createdAt: '2025-03-01T10:00:00Z',
        },
      ],
      meta: { page, total: 1, totalPages: 1 },
    })
  }),
]
