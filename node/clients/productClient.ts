import type { IOContext, InstanceOptions } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export default class ProductClient extends JanusClient {
  private baseUrl = '/api/catalog_system/pvt/products/productget'

  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdClientAutCookie: context.adminUserAuthToken ?? context.authToken,
      },
    })
  }

  public get(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`)
  }
}
