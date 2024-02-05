import type { IOContext, InstanceOptions } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export default class ProductWithSkusClient extends JanusClient {
  private baseUrl = '/api/catalog_system/pub/products/variations'

  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      // `https://${context.account}.vtexcommercestable.com.br/api/catalog_system/pub/products/variations`,
      context,
      {
        ...options,
        headers: {
          ...options?.headers,
          VtexIdClientAutCookie: context.authToken,
        },
      }
    )
  }

  public get(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`)
  }
}
