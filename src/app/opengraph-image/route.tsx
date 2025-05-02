import React from 'react';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { WEBSITE_URL } from '@/constants/app';

// Image metadata
export const alt = 'Nounspace';

// 3:2 aspect ratio as requested
export const size = {
  width: 1200,
  height: 800,
};

export const contentType = 'image/png';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Image generation
export async function GET(request: NextRequest) {
  try {
    // Get image URL from request parameters
    const url = request.nextUrl ?? new URL(request.url || '', WEBSITE_URL); 
    const searchParams = url.searchParams;
    const imageUrl = searchParams.get('image');
    const title = searchParams.get('title') || 'Nounspace';
    
    const appUrl = process.env.NEXT_PUBLIC_URL;
    const frameImageUrl = `${appUrl}/images/rainforest.png`;
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black',
            position: 'relative',
          }}
        >
          {/* Base frame image */}
          <img
            src={frameImageUrl}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            alt={title}
          />
          
          {/* Centered content image if provided */}
          {imageUrl && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              height: '85%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={imageUrl}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
                alt={title}
              />
            </div>
          )}
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    console.error('Error generating OpenGraph image:', error);
    
    // Fallback to default image
    const appUrl = process.env.NEXT_PUBLIC_URL;
    const fallbackImageUrl = `${appUrl}/images/nounspace_og_low.png`;
    
    console.log("fallback opengraph image", fallbackImageUrl);
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black',
          }}
        >
          <img
            src={fallbackImageUrl}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            alt="Nounspace"
          />
        </div>
      ),
      { ...size }
    );
  }
}
