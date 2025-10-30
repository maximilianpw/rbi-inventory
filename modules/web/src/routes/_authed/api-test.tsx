import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useApiClient, API_ENDPOINTS } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authed/api-test')({
  component: ApiTestPage,
})

function ApiTestPage() {
  const api = useApiClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { success: boolean; data?: any; error?: string }>>({})

  async function testEndpoint(name: string, testFn: () => Promise<any>) {
    setLoading(name)
    try {
      const data = await testFn()
      setResults((prev) => ({
        ...prev,
        [name]: { success: true, data },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      }))
    } finally {
      setLoading(null)
    }
  }

  const tests = [
    {
      name: 'Health Check',
      description: 'Test unauthenticated endpoint',
      run: async () => {
        const response = await fetch('http://localhost:8080/health-check')
        return response.json()
      },
    },
    {
      name: 'Auth Profile',
      description: 'Get authenticated user profile from Clerk',
      run: () => api.get(API_ENDPOINTS.auth.profile),
    },
    {
      name: 'Auth Session',
      description: 'Get session claims and token info',
      run: () => api.get(API_ENDPOINTS.auth.session),
    },
    {
      name: 'List Users',
      description: 'Get all users from database',
      run: () => api.get(API_ENDPOINTS.users.list),
    },
    {
      name: 'Search Users',
      description: 'Search users by name',
      run: () => api.get(API_ENDPOINTS.users.search('test')),
    },
  ]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Test Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Test your backend API endpoints with authenticated Clerk tokens
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Backend URL:</strong> http://localhost:8080/api/v1
          <br />
          <strong>Auth Method:</strong> Clerk JWT via Authorization Bearer header
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {tests.map((test) => {
          const result = results[test.name]
          const isLoading = loading === test.name

          return (
            <Card key={test.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {test.name}
                  {result && (
                    result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )
                  )}
                </CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => testEndpoint(test.name, test.run)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Endpoint'
                  )}
                </Button>

                {result && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {result.success ? (
                        <span className="text-green-600">Success</span>
                      ) : (
                        <span className="text-red-600">Error: {result.error}</span>
                      )}
                    </div>
                    {result.data && (
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
