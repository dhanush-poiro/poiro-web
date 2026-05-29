import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const email = data.get('email')?.toString().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Log to console for now — wire up to a CRM/mailing list as needed
    console.log('[Get Access]', { email, ts: new Date().toISOString() });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
