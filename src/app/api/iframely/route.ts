import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const apiKey = process.env.NEXT_PUBLIC_IFRAMELY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Iframely API key is missing' });
    }

    try {
        const response = await fetch(
            `https://iframe.ly/api/iframely?url=${encodeURIComponent(url)}&api_key=${apiKey}&omit_css=true`
        );
        const data = await response.json();

        if (data.html) {
            res.status(200).json({ html: data.html });
        } else {
            res.status(400).json({ error: 'Unable to fetch embed HTML' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
