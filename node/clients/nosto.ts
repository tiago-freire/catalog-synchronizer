import type { IOContext, InstanceOptions } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { convertCategories } from '../helpers'

export default class NostoClient extends ExternalClient {
  private nostoToken = ''

  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://api.nosto.com/v1', context, options)
  }

  public setNostoToken(token: string) {
    this.nostoToken = token
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public converter(data: { product: any; sku: any; currencyCode: string }) {
    const { currencyCode, product, sku } = data
    const { Id, name, Description, LinkId } = product
    const firstSku = sku ?? product?.skus?.[0]

    const {
      ProductCategories = {},
      image,
      available,
      bestPrice = 0,
      listPrice = 0,
      BrandName,
      availablequantity,
    } = firstSku

    const price = bestPrice / 100
    const categories = convertCategories(ProductCategories)
    const firstSkuListPrice = listPrice / 100 || price

    return {
      product_id: Id,
      name,
      description: Description,
      categories,
      url: `https://${this.context.account}.myvtex.com/${LinkId}/p`,
      image_url: image,
      availability: available ? 'InStock' : 'OutOfStock',
      price,
      list_price: firstSkuListPrice,
      price_currency_code: currencyCode,
      brand: BrandName,
      inventory_level: availablequantity || 0,
    }
  }

  public updateProduct(nostoProduct: unknown) {
    return this.http.post('/products/upsert', [nostoProduct], {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`:${this.nostoToken}`)}`,
      },
    })
  }
}
