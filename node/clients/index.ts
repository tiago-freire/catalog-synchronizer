import { IOClients } from '@vtex/api'
import { Catalog } from '@vtex/clients'

import AlgoliaClient from './algolia'
import NostoClient from './nosto'
import ProductClient from './productClient'
import ProductWithSkusClient from './productWithSkusClient'

export class Clients extends IOClients {
  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get productClient() {
    return this.getOrSet('productClient', ProductClient)
  }

  public get productWithSkusClient() {
    return this.getOrSet('productWithSkusClient', ProductWithSkusClient)
  }

  public get nostoClient() {
    return this.getOrSet('nostoClient', NostoClient)
  }

  public get algoliaClient() {
    return this.getOrSet('algoliaClient', AlgoliaClient)
  }
}
