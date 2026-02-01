import { NextRequest, NextResponse } from 'next/server';

const SPEECH_API_URL = process.env.SPEECH_API_URL!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${SPEECH_API_URL}/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json({ success: false, error: text }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Speech service unreachable' },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${SPEECH_API_URL}/health`);
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ status: 'offline' }, { status: 503 });
  }
}
