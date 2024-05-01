import { type EmailOtpType } from '@supabase/supabase-js'

import createClient from '@/common/data/database/supabase/api'
import { NextRequest, NextResponse } from 'next/server';
import { get } from 'lodash';

function stringOrFirstString(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item
}

export async function POST(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams;
  const token_hash = stringOrFirstString(get(queryParams, "token_hash", ""));
  const type = stringOrFirstString(get(queryParams, "type", ""));

  const resp = NextResponse.redirect("/error"); 

  if (token_hash && type) {
    const supabase = createClient(req, resp)
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    })
    if (error) {
      console.error(error)
    } else {
      // When no error, change redirect to the "next" query param or to root
      resp.headers.set("Location", stringOrFirstString(get(queryParams, "next")) || '/');
    }
  }

  return resp;
}