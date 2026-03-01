import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ message: 'Logged out' })
  res.cookies.set('authToken', '', { maxAge: -1 })
  return res
}
