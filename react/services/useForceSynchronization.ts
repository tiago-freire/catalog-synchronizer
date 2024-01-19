import { useMutation } from '@tanstack/react-query'
import { useRuntime } from 'vtex.render-runtime'

import { ApiResponse, apiRequestFactory } from '.'

type Response = ApiResponse & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sku?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nostoProduct?: any
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
        `/_v/catalogsynchronizer?workspace=${workspace}`,
        'POST',
        { ProductId }
      )(),
  })

  return mutationForceSynchronization
}
