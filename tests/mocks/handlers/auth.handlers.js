import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:3000/api'

export const authHandlers = [
  http.post(`${BASE}/auth/sign-in`, async ({ request }) => {
    const body = await request.json()

    if (body.email === 'test@hustle.io' && body.password === 'password123') {
      return HttpResponse.json({
        user:  { id: 'u1', name: 'Test User', email: body.email, role: 'creator' },
        token: 'mock-token-abc123',
      })
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post(`${BASE}/auth/sign-up`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      user:  { id: 'u2', name: body.name, email: body.email, role: body.role },
      token: 'mock-token-new-user',
    }, { status: 201 })
  }),

  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json({
      user: { id: 'u1', name: 'Test User', email: 'test@hustle.io', role: 'creator' },
    })
  }),

  http.post(`${BASE}/auth/sign-out`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.post(`${BASE}/auth/forgot-password`, () => {
    return HttpResponse.json({ message: 'Reset email sent.' })
  }),
]
