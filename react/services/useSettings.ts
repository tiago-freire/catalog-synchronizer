import { useMutation, useQuery } from '@tanstack/react-query'
import { useRuntime } from 'vtex.render-runtime'

import { ApiResponse, apiRequestFactory } from '.'

type Settings = {
  nostoIntegrationEnabled?: boolean
  nostoAccountID?: string
  nostoToken?: string
  algoliaIntegrationEnabled?: boolean
  algoliaApplicationID?: string
  algoliaAPIKey?: string
}

type Response = ApiResponse & Settings

export const useSettings = () => {
  const { workspace } = useRuntime()

  const getSettings = useQuery({
    queryKey: ['settings', workspace],
    queryFn: apiRequestFactory<Response>(
      `/_v/catalogsynchronizer/get-settings?workspace=${workspace}`
    ),
  })

  const mutationUpdateSettings = useMutation({
    mutationKey: ['settings', workspace],
    mutationFn: async (settings: Settings) =>
      apiRequestFactory<Response>(
        `/_v/catalogsynchronizer/update-settings?workspace=${workspace}`,
        'POST',
        settings
      )(),
  })

  return { getSettings, mutationUpdateSettings }
}
