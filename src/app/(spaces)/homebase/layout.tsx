'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PrivateSpace from './PrivateSpace';

export default function HomebaseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug?: string[] }>();
  const segments = params?.slug || [];

  let tabName = 'Feed';
  let castHash: string | undefined;

  if (segments.length === 1) {
    tabName = decodeURIComponent(segments[0]);
  } else if (segments.length >= 3 && segments[0] === 'c') {
    castHash = decodeURIComponent(segments[2]);
  } else if (segments.length >= 2) {
    castHash = decodeURIComponent(segments[1]);
  }

  return <PrivateSpace tabName={tabName} castHash={castHash} />;
}
