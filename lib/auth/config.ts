export const SESSION_COOKIE_NAME = 'wabmarket_session'

export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5
export const SESSION_COOKIE_MAX_AGE_MS = SESSION_COOKIE_MAX_AGE_SECONDS * 1000

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
}
