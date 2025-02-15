import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC } from 'react'
import React from 'react'

export type ApiResponse = {
  code?: string
  message?: string
  response?: {
    data?:
      | string
      | {
          errors?: Array<{ errors?: string }>
          message?: string
          error?: string
        }
  }
}

const MAX_RETRIES = 10

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const e = error as Error

        console.error('Query Error:', {
          errorMessage: e.message,
          failureCount: `${failureCount}/${MAX_RETRIES}`,
        })

        return (
          (e.message.toLowerCase().includes('unhealthy') ||
            e.message.toLowerCase().includes('genericerror')) &&
          failureCount < MAX_RETRIES
        )
      },
    },
  },
})

export function withQueryProvider<P>(Component?: FC<P>) {
  const WrappedComponent: FC<P> = (props) => (
    <QueryClientProvider client={queryClient}>
      {Component && <Component {...props} />}
    </QueryClientProvider>
  )

  return WrappedComponent
}

export const apiRequestFactory = <R extends ApiResponse, B = unknown>({
  url,
  method,
  body,
  headers,
}: {
  url: string
  method?: string
  body?: B
  headers?: HeadersInit
}) => {
  return async () => {
    const response = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers,
    })
    const json: R = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof json?.response?.data === 'object'
          ? json?.response?.data?.errors?.[0]?.errors ??
            json?.response?.data?.error ??
            json?.response?.data?.message
          : json?.response?.data?.length
          ? json?.response?.data
          : json?.message ?? json?.code ?? response.status.toString()
      )
    }

    return json
  }
}

export * from './useForceSynchronization'
export * from './useSettings'
