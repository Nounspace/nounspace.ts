import React from 'react';
import { ImageResponse } from 'next/og';
import { WEBSITE_URL } from '@/constants/app';

// Image metadata
export const alt = 'Nounspace';

// 3:2 aspect ratio
export const size = {
  width: 1200,
  height: 800,
};

export const contentType = 'image/png';

// Image generation - changed from GET function to default export function
export default async function Image({ params }: { params: { proposalId: string } }) {
  try {
    console.log("params", params);

    // Get image URL from search parameters
    // const imageUrl = params?.image;
    const imageUrl = null;
    const title = params?.proposalId || 'Nounspace';

    const frameImageUrl = `${WEBSITE_URL}/images/rainforest.png`;
    
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
    const WEBSITE_URL = process.env.NEXT_PUBLIC_URL;
    const fallbackImageUrl = `${WEBSITE_URL}/images/nounspace_og_low.png`;
    
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
