'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface InvitationData {
  email: string
  role: string
  organization: {
    id: string
    name: string
    slug: string
    logo: string | null
  }
  expiresAt: string
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/auth/invite/${params.token}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error)
        } else {
          setInvitation(data.invitation)
        }
      } catch {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    if (params.token) {
      fetchInvitation()
    }
  }, [params.token])

  const handleAccept = async () => {
    if (!session) {
      // Redirect to login with callback
      router.push(`/auth/login?callbackUrl=/auth/invite/${params.token}`)
      return
    }

    setAccepting(true)
    try {
      const response = await fetch(`/api/auth/invite/${params.token}`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
      } else {
        setAccepted(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      }
    } catch {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              You&apos;ve joined {invitation?.organization.name}. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>You&apos;re Invited!</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {invitation && (
            <>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">{invitation.organization.name}</h3>
                <p className="text-sm text-gray-500">
                  Role: <span className="font-medium">{invitation.role}</span>
                </p>
                <p className="text-xs text-gray-400">
                  Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                </p>
              </div>

              {status === 'unauthenticated' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Please log in to accept this invitation
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/auth/login?callbackUrl=/auth/invite/${params.token}`)}
                  >
                    Log in to Accept
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Logged in as <span className="font-medium">{session?.user?.email}</span>
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleAccept}
                    disabled={accepting}
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      'Accept Invitation'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
