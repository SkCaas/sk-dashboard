import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/login(.*)', '/register(.*)']);

import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const authObj = await auth();
    authObj.protect();

    // If the user is logged in, has no active organization, and is not on the onboarding page, redirect to onboarding.
    if (authObj.userId && !authObj.orgId && req.nextUrl.pathname !== '/onboarding') {
      const orgSelection = new URL('/onboarding', req.url);
      return NextResponse.redirect(orgSelection);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
