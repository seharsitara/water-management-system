import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    let token = request.cookies.get('authToken')?.value
    if (!token) {
      // Try Authorization header
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with backend
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    if (baseUrl.includes('localhost:3000')) {
      console.warn('API base URL points to the frontend; check your .env settings')
    }
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to verify token')
    }

    const user = await response.json()
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
