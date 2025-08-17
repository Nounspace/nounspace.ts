import { describe, it, expect } from 'vitest';
import { isVideoUrl } from '../src/common/lib/utils/urls';

describe('isVideoUrl', () => {
  it('detects video URLs regardless of case', () => {
    expect(isVideoUrl('https://stream.warpcast.com/clip.mp4')).toBe(true);
    expect(isVideoUrl('https://STREAM.WARPCAST.COM/CLIP.MP4')).toBe(true);
    expect(isVideoUrl('https://Stream.Warpcast.com/video.WEBM')).toBe(true);
    expect(isVideoUrl('https://warpcast.com/~/video/123')).toBe(true);
    expect(isVideoUrl('https://example.com/test.MOV')).toBe(true);
  });

  it('detects Walrus video URLs', () => {
    expect(isVideoUrl('https://aggregator.walrus-testnet.walrus.space/v1/blobs/abc123')).toBe(true);
    expect(isVideoUrl('https://walrus-testnet-aggregator.nodes.guru/v1/blobs/xyz789')).toBe(true);
    expect(isVideoUrl('https://aggregator.walrus-testnet.walrus.space/v1/blobs/abc123.mp4')).toBe(true);
    expect(isVideoUrl('https://aggregator.walrus-testnet.walrus.space/v1/blobs/abc123?media=video')).toBe(true);
    
    // Test our proxy API URLs
    expect(isVideoUrl('https://nounspace.com/api/walrus-video/abc123')).toBe(true);
    expect(isVideoUrl('https://nounspace.com/api/walrus-video/abc123.mp4')).toBe(true);
    expect(isVideoUrl('https://localhost:3000/api/walrus/video/xyz789')).toBe(true);
    
    // Test video page URLs
    expect(isVideoUrl('https://nounspace.com/video/walrus/abc123')).toBe(true);
  });

  it('returns false for non-video URLs', () => {
    expect(isVideoUrl('https://example.com/image.png')).toBe(false);
  });
});
