import type { IOContext, InstanceOptions } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class AlgoliaClient extends ExternalClient {
  private applicationId = ''
  private apiKey = ''

  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
        'Proxy-Authorization': context.authToken,
        VtexIdclientAutcookie: context.authToken,
      },
    })
  }

  public setAuthentication(applicationId: string, apiKey: string) {
    this.applicationId = applicationId
    this.apiKey = apiKey
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async updateProduct(algoliaProduct: any) {
    const response = await this.http.postRaw(
      `https://${this.applicationId}.algolia.net/1/indexes/products`,
      algoliaProduct,
      {
        headers: {
          ...this.options?.headers,
          'X-Algolia-Application-Id': this.applicationId,
          'X-Algolia-API-Key': this.apiKey,
        },
      }
    )

    return response.data
  }
}
