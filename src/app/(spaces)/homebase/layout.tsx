'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PrivateSpace from './PrivateSpace';

export default function HomebaseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string[] }>();

  const tabName = params?.slug?.[0] ? decodeURIComponent(params.slug[0]) : 'Feed';
  const castHash = params?.slug?.[1] ? decodeURIComponent(params.slug[1]) : undefined;

  return (
    <>
      <PrivateSpace tabName={tabName} castHash={castHash} />
      {children}
    </>
  );
} 