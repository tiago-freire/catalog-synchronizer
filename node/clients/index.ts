import { IOClients } from '@vtex/api'
import { Catalog } from '@vtex/clients'

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
}
