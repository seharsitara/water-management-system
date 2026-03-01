import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('signup body', body)
    const { email, name, password } = body

    // ensure base URL is configured
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL
    if (!baseUrl) {
      console.warn('API base URL not set, using http://localhost:8000 (backend)')
      baseUrl = 'http://localhost:8000'
    }
    if (baseUrl.includes('localhost:3000')) {
      console.warn('API base URL points to the frontend; make sure it is your backend URL')
    }
    // Call your NestJS backend
    const fetchUrl = `${baseUrl}/auth/signup`
    console.log('fetching backend url', fetchUrl)
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('backend signup error', response.status, text)
      throw new Error(text || 'Signup failed')
    }

    const data = await response.json()
    const res = NextResponse.json({
      user: { id: data.user?.id, email: data.user?.email, name: data.user?.name },
      token: data.access_token,
    })

    // Store token in cookie
    res.cookies.set('authToken', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
