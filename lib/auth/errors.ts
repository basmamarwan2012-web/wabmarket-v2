export function getAuthenticationErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account already exists for this email address.'
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'The email address or password is incorrect.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait and try again.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Authentication failed. Please try again.'
}
