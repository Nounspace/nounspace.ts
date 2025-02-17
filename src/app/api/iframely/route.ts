import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_IFRAMELY_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Iframely API key is missing' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://iframe.ly/api/iframely?url=${encodeURIComponent(url)}&api_key=${apiKey}&omit_css=true`
        );
        const data = await response.json();

        if (data.html) {
            return NextResponse.json({ html: data.html });
        } else {
            return NextResponse.json({ error: 'Unable to fetch embed HTML' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
