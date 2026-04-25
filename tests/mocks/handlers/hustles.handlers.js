import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:3000/api'

const mockHustle = {
  id:          'h1',
  title:       'Lash Extension Expert Needed',
  description: 'Looking for a certified lash technician.',
  status:      'active',
  skillLevel:  'expert',
  budget:      { min: 5000, max: 8000, currency: 'NGN' },
  createdAt:   '2025-01-01T00:00:00Z',
  creator:     { id: 'u1', name: 'Test Creator', avatarUrl: null },
}

export const hustlesHandlers = [
  http.get(`${BASE}/hustles`, ({ request }) => {
    const url    = new URL(request.url)
    const page   = Number(url.searchParams.get('page') ?? 1)
    const limit  = Number(url.searchParams.get('limit') ?? 12)

    return HttpResponse.json({
      data: [mockHustle],
      meta: { page, limit, total: 1, totalPages: 1 },
    })
  }),

  http.get(`${BASE}/hustles/:id`, ({ params }) => {
    if (params.id === 'h1') {
      return HttpResponse.json({ data: mockHustle })
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),

  http.get(`${BASE}/hustles/mine`, () => {
    return HttpResponse.json({
      data: [mockHustle],
      meta: { page: 1, total: 1, totalPages: 1 },
    })
  }),

  http.post(`${BASE}/hustles`, () => {
    return HttpResponse.json({ data: { ...mockHustle, id: 'h2' } }, { status: 201 })
  }),

  http.post(`${BASE}/hustles/:id/complete`, ({ params }) => {
    return HttpResponse.json({
      data: { ...mockHustle, id: params.id, status: 'pending_approval' },
    })
  }),

  http.post(`${BASE}/hustles/:id/approve`, ({ params }) => {
    return HttpResponse.json({
      data: { ...mockHustle, id: params.id, status: 'completed' },
    })
  }),
]
