import React from 'react';
import OnchainEmbed from './OnchainEmbed';
import WarpcastEmbed from './WarpcastEmbed';
import TweetEmbed from './TweetEmbed';
import NounsBuildEmbed from './NounsBuildEmbed';
import ParagraphXyzEmbed from './ParagraphXyzEmbed';

export const renderEmbedForUrl = ({ url }: { url: string }) => {
  if (!url) return null;

  if (url.startsWith('"chain:')) {
    return <OnchainEmbed url={url} />
  } else if (url.startsWith('https://warpcast.com')) {
    return <WarpcastEmbed url={url} />
  } else if ((url.includes('twitter.com') || url.startsWith('https://x.com')) && url.includes('status/')) {
    const tweetId = url.split('/').pop();
    return tweetId ? <TweetEmbed tweetId={tweetId} /> : null;
  } else if (url.startsWith('https://nouns.build')) {
    return <NounsBuildEmbed url={url} />
  } else if (url.includes('paragraph.xyz') || url.includes('pgrph.xyz')) {
    return <ParagraphXyzEmbed url={url} />
  } else {
    return null;
  }
}
