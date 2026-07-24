import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = (req: any) => {
  const path = req.nextUrl.pathname;
  return path.startsWith('/sign-in') || path.startsWith('/sign-up') || path === '/';
};

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
    const authObj = await auth();

    if (
      authObj.userId && 
      !authObj.orgId && 
      req.nextUrl.pathname !== '/onboarding' && 
      !req.nextUrl.pathname.startsWith('/api')
    ) {
      console.log("Middleware redirecting to onboarding for user", authObj.userId);
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
