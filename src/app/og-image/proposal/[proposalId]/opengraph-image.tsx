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

// Function to fetch proposal data
async function loadProposalData(proposalId: string) {
  try {
    const response = await fetch("https://www.nouns.camp/subgraphs/nouns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query Proposal($proposalId: ID!) {
            proposal(id: $proposalId) {
              id
              title
              createdTimestamp
              proposer {
                id
              }
              signers {
                id
              }
              description
            }
          }`,
        variables: {
          proposalId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch proposal data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data.proposal;
  } catch (error) {
    console.error("Error loading proposal data:", error);
    return {
      id: proposalId,
      title: "Error loading proposal",
      proposer: {
        id: "0x0",
      },
      description: "",
    };
  }
}

/**
 * Extracts the first URL ending with jpeg, jpg, png, or containing "image" in the path
 */
function extractFirstImageUrl(text: string): string | null {
  if (!text) return null;
  
  // Match URLs that end with image extensions or contain 'image' in the path
  const regex = /(https?:\/\/[^\s]+\.(jpeg|jpg|png|gif|webp)|https?:\/\/[^\s]+image[^\s]*)/i;
  const match = text.match(regex);
  
  return match ? match[0] : null;
}

// Image generation - changed from GET function to default export function
export default async function Image({ params }: { params: { proposalId: string } }) {
  try {
    console.log("params", params);
    
    const proposalData = await loadProposalData(params.proposalId);
    
    // Extract image URL from proposal description if available
    const imageUrl = proposalData.description 
      ? extractFirstImageUrl(proposalData.description)
      : null;
      
    const title = proposalData.title || params?.proposalId || 'Nounspace';

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
