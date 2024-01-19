import { ServiceContext } from '@vtex/api'

import { Clients } from '../clients'

const responseSettings = async (context: ServiceContext<Clients, State>) => {
  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Headers', '*')
  context.set('Access-Control-Allow-Methods', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Content-Type', 'application/json')
  context.body = { ...context.state.settings }
  context.status = 200
}

export default responseSettings
