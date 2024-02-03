import { useMutation } from '@tanstack/react-query'
import { useRuntime } from 'vtex.render-runtime'

import { ApiResponse, apiRequestFactory } from '.'

type Response = ApiResponse & {
  product?: unknown
  sku?: unknown
  nostoProduct?: unknown
  nostoResponse?: unknown
  algoliaProduct?: unknown
  algoliaResponse?: unknown
  errors?: string[]
}

type MutationArgs = {
  ProductId: string
}

export const useForceSynchronization = () => {
  const { workspace } = useRuntime()

  const mutationForceSynchronization = useMutation({
    mutationKey: ['forceSynchronization', workspace],
    mutationFn: async ({ ProductId }: MutationArgs) =>
      apiRequestFactory<Response>({
        url: `/_v/private/catalogsynchronizer?workspace=${workspace}`,
        method: 'POST',
        body: { ProductId },
      })(),
  })

  return mutationForceSynchronization
}
