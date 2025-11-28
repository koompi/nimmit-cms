import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      organizationId?: string | null
      username?: string | null
      firstName?: string | null
      lastName?: string | null
      telegramId?: number | null
      walletAddress?: string | null
    } & DefaultSession['user']
  }

  interface User {
    role: string
    organizationId?: string | null
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    telegramId?: number | null
    walletAddress?: string | null
  }
}