import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    message: 'Walrus video endpoint test',
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });
}
