import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to generate thumbnails for Walrus videos
 * This is a placeholder that could be enhanced with actual thumbnail generation
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobId: rawBlobId } = req.query;

  if (!rawBlobId || typeof rawBlobId !== 'string') {
    return res.status(400).json({ error: 'Invalid blob ID' });
  }

  // Remove .jpg extension if present
  const blobId = rawBlobId.replace(/\.(jpg|jpeg|png)$/, '');

  // Validate blob ID format
  if (!/^[a-zA-Z0-9_-]+$/.test(blobId)) {
    return res.status(400).json({ error: 'Invalid blob ID format' });
  }

  try {
    // For now, return the video URL itself - some platforms can extract thumbnail from video
    // In the future, this could generate actual video thumbnails
    
    // Try to get the video URL and let platforms extract thumbnail
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                    'http://localhost:3000';
    
    const videoUrl = `${baseUrl}/api/walrus/video/${blobId}`;
    
    // Return the video URL itself - Farcaster can extract thumbnail from video
    res.redirect(302, videoUrl);
    
  } catch (error) {
    console.error('Error generating Walrus video thumbnail:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
