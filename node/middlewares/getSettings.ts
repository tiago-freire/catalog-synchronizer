import { LogLevel, ServiceContext, log } from '@vtex/api'

import { Clients } from '../clients'

const getSettings = async (
  context: ServiceContext<Clients, State>,
  next: () => Promise<void>
) => {
  const {
    clients: { apps, nostoClient, algoliaClient },
  } = context

  const appSettings: Settings = await apps.getAppSettings(
    process.env.VTEX_APP_ID ?? ''
  )

  log(`Settings: ${JSON.stringify(appSettings)}`, LogLevel.Info)

  nostoClient.setNostoToken(appSettings?.nostoToken as string)
  algoliaClient.setAuthentication(
    appSettings?.algoliaApplicationID as string,
    appSettings?.algoliaAPIKey as string
  )

  context.state.settings = { ...appSettings }

  await next()
}

export default getSettings
