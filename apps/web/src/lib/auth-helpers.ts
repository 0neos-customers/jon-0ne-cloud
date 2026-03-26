import { auth, clerkClient } from '@clerk/nextjs/server'

/**
 * Require authenticated user. Throws 401 if not authenticated.
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth()
  if (!userId) {
    throw new AuthError('Authentication required', 401)
  }
  return { userId }
}

/**
 * Require admin role. Throws 401 if not authenticated, 403 if not admin.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await requireAuth()
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = user.publicMetadata?.role as string | undefined
  if (role !== 'admin' && role !== 'owner') {
    throw new AuthError('Admin role required', 403)
  }
  return { userId }
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'AuthError'
  }
}
