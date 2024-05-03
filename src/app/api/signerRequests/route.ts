import { createSignerRequest, getSignerRequestStatus } from '@/common/data/api/warpcastLogin';
import { get } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signerRequestResult = await createSignerRequest(body);
  return NextResponse.json(signerRequestResult);
}

export async function GET(req: NextRequest) {
  const signerToken = get(req.nextUrl.searchParams, "signerToken", "") as string;
  const signerStatus = await getSignerRequestStatus(signerToken)
  return NextResponse.json(signerStatus);
}