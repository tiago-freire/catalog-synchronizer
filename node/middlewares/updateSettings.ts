import { LogLevel, ServiceContext, log } from '@vtex/api'
import { json } from 'co-body'

import { Clients } from '../clients'

const updateSettings = async (context: ServiceContext<Clients, State>) => {
  const {
    req,
    clients: { apps },
  } = context

  const payload = await json(req)

  log(`Settings payload: ${JSON.stringify(payload)}`, LogLevel.Info)

  await apps.saveAppSettings(process.env.VTEX_APP_ID ?? '', {
    ...context.state.settings,
    ...payload,
  })

  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Headers', '*')
  context.set('Access-Control-Allow-Methods', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Content-Type', 'application/json')
  context.body = { ...payload }
  context.status = 200
}

export default updateSettings
