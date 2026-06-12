import { NextRequest, NextResponse } from 'next/server';

const HS_PORTAL_ID = '242333258';
const HS_FORM_ID   = '5aaeab45-6089-41a2-a18e-0978395154c7';
const HS_ENDPOINT  = `https://api.hsforms.com/submissions/v3/integration/submit/${HS_PORTAL_ID}/${HS_FORM_ID}`;

export async function POST(req: NextRequest) {
  try {
    const data  = await req.formData();
    const email = data.get('email')?.toString().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const hutk = req.cookies.get('hubspotutk')?.value;

    const payload: Record<string, unknown> = {
      fields: [{ name: 'email', value: email }],
      context: {
        pageUri:  'https://poiro.com/get-access',
        pageName: 'Get Access',
        ...(hutk ? { hutk } : {}),
      },
    };

    const hsRes = await fetch(HS_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!hsRes.ok) {
      const detail = await hsRes.text();
      console.error('[Get Access] HubSpot error', hsRes.status, detail);
      return NextResponse.json({ error: 'Submission failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Get Access] unexpected error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
