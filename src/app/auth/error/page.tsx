'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact the administrator.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in. Please contact the administrator if you believe this is an error.',
  },
  Verification: {
    title: 'Verification Error',
    description: 'The verification link may have expired or already been used. Please try signing in again.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'Could not start the OAuth sign in process. Please try again.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'There was an error during the OAuth authentication process. Please try again.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create your account. Please try again or contact support.',
  },
  EmailCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create your account with this email. Please try again.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'There was an error during the authentication callback. Please try again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another sign-in method. Please use your original sign-in method.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You need to be signed in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication. Please try again.',
  },
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error') || 'Default'
  const errorInfo = errorMessages[errorCode] || errorMessages.Default

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-red-600">
          {errorInfo.title}
        </CardTitle>
        <CardDescription className="text-center">
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {errorCode !== 'Default' && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded text-center">
            Error code: {errorCode}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <Button asChild className="w-full">
          <Link href="/auth/login">
            Try Again
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">
            Go to Homepage
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function AuthErrorFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<AuthErrorFallback />}>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}
