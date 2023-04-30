import { withClerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/sign-in*", "/sign-up*"];

const isPublic = (path) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

export default withClerkMiddleware((request) => {
  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { userId } = getAuth(request);

  if (!userId) {

    if ( request.nextUrl.pathname.startsWith('/api/') ) {
      return new NextResponse(
        JSON.stringify({
          status: 'Unauthorized'
        }),
        {
          status: 401,
          headers: { "content-type": "application/json"
        }
      });
    }
    
    const signInUrl = new URL('/sign-in', request.url);
    
    signInUrl.searchParams.set('redirect_url', request.url);

    return NextResponse.redirect(signInUrl);

  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
  ],
}