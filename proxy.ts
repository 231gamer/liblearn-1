import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const protectedRoutes = ['/dashboard', '/quiz', '/leaderboard', '/profile', '/admin']
  const authRoutes = ['/auth/login', '/auth/signup']
  const setupRoute = '/profile/setup'
  const adminRoute = '/admin'

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))
  const isSetupRoute = pathname === setupRoute
  const isAdminRoute = pathname.startsWith(adminRoute)

  // Not logged in → login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('error', 'Please+sign+in+to+continue')
    return NextResponse.redirect(url)
  }

  // Logged in → away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Logged in but no username → force setup
  if (user && isProtectedRoute && !isSetupRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.username) {
      const url = request.nextUrl.clone()
      url.pathname = setupRoute
      return NextResponse.redirect(url)
    }

    // Admin route — check is_admin flag
    if (isAdminRoute && !profile?.is_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}