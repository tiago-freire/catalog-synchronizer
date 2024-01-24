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
}

type MutationArgs = {
  ProductId: string
}

export const useForceSynchronization = () => {
  const { workspace } = useRuntime()

  const mutationForceSynchronization = useMutation({
    mutationKey: ['forceSynchronization', workspace],
    mutationFn: async ({ ProductId }: MutationArgs) =>
      apiRequestFactory<Response>(
        `/_v/private/catalogsynchronizer?workspace=${workspace}`,
        'POST',
        { ProductId }
      )(),
  })

  return mutationForceSynchronization
}
