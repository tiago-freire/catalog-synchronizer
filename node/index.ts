import type { Cached, ClientsConfig, Maybe, RecorderState } from '@vtex/api'
import { LRUCache, Service, method } from '@vtex/api'

import { Clients } from './clients'
import getSettings from './middlewares/getSettings'
import responseSettings from './middlewares/responseSettings'
import synchronizeCatalog from './middlewares/synchronizeCatalog'
import updateSettings from './middlewares/updateSettings'

declare global {
  type Settings = Record<string, Maybe<string | boolean>>

  type State = RecorderState & {
    settings: Settings
  }
}

const TIMEOUT_MS = 4 * 1000
const CONCURRENCY = 10
const memoryCache = new LRUCache<string, Cached>({ max: 5000 })

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      exponentialTimeoutCoefficient: 2,
      exponentialBackoffCoefficient: 2,
      initialBackoffDelay: 100,
      retries: 10,
      timeout: TIMEOUT_MS,
      concurrency: CONCURRENCY,
      memoryCache,
    },
  },
}

export default new Service({
  clients,
  routes: {
    catalogSynchronizer: method({ POST: [getSettings, synchronizeCatalog] }),
    getSettings: method({ GET: [getSettings, responseSettings] }),
    updateSettings: method({ POST: [getSettings, updateSettings] }),
  },
})
