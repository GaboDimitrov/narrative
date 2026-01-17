import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API is working' });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const entries = Object.fromEntries(formData.entries());
  return NextResponse.json({ received: entries });
}
