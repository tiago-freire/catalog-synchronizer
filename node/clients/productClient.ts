import type { IOContext, InstanceOptions } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class ProductClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `https://${context.account}.vtexcommercestable.com.br/api/catalog_system/pvt/products/productget`,
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
    return this.http.get(`/${id}`)
  }
}
