"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import SpaceLoading from '@/app/(spaces)/SpaceLoading';

const HomeWithoutSSR = dynamic(() => import('./HomeContent'), {
  ssr: false,
  loading: () => <SpaceLoading hasProfile={false} hasFeed={false} />
});

export default function Home() {
  return <HomeWithoutSSR />;
}
