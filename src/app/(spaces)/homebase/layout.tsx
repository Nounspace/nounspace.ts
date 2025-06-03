'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PrivateSpace from './PrivateSpace';

export default function HomebaseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{
    tabname?: string;
    caster?: string;
    castHash?: string;
  }>();

  const tabName = params?.tabname ? decodeURIComponent(params.tabname) : 'Feed';
  const castHash = params?.castHash ? decodeURIComponent(params.castHash) : undefined;

  return <PrivateSpace tabName={tabName} castHash={castHash} />;
}
