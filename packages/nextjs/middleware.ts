import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Viem's address regex
const addressRegex = /^0x[a-fA-F0-9]{40}$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract the first path segment after the initial slash, if any.
  const pathSegments = pathname.split("/").filter(Boolean);

  // Check if there is exactly one path segment and if it matches the address regex.
  if (pathSegments.length === 1 && addressRegex.test(pathSegments[0])) {
    const newURL = new URL(`/${pathSegments[0]}/1`, request.url);
    return NextResponse.redirect(newURL);
  }

  // For all other requests, proceed with normal handling.
  return NextResponse.next();
}
