import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isAllowedOrigin = origin.includes("localhost") || origin.includes("vercel.app");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const preflightResponse = new NextResponse(null, { status: 204 });
    
    if (isAllowedOrigin) {
      preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
    }
    
    preflightResponse.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    preflightResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-api-version, x-csrftoken, x-requested-with");
    preflightResponse.headers.set("Access-Control-Allow-Credentials", "true");
    preflightResponse.headers.set("Access-Control-Max-Age", "86400");

    return preflightResponse;
  }

  // Handle actual requests
  const response = NextResponse.next();
  
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-api-version, x-csrftoken, x-requested-with");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
