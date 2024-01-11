import { LogLevel, NotFoundError, ServiceContext, log } from '@vtex/api'
import { json } from 'co-body'

import { Clients } from '../clients'

const customLog = (title: string, object: unknown) =>
  log(`${title}: ${JSON.stringify(object, null, 2)}`, LogLevel.Info)

const synchronizeCatalog = async (context: ServiceContext<Clients>) => {
  const {
    req,
    clients: { catalog, productClient, productWithSkusClient },
  } = context

  const payload = await json(req)
  customLog('Catalog notification payload', payload)

  const { ProductId, IdSku } = payload

  if (!IdSku && !ProductId) {
    throw new NotFoundError('IdSku or ProductId is required')
  }

  const getFullSku = async (skuId: string) => {
    const [singleSku, skuContext] = await Promise.all([
      catalog.getSkuById(skuId),
      catalog.getSkuContext(skuId),
    ])

    return { ...singleSku, ...skuContext }
  }

  let sku
  let product

  if (IdSku) {
    sku = await getFullSku(IdSku)
    customLog('SKU', sku)
  }

  const idProduct = ProductId || sku?.ProductId

  if (idProduct) {
    const [singleProduct, productWithSkus] = await Promise.all([
      productClient.get(idProduct),
      productWithSkusClient.get(idProduct),
    ])

    product = { ...productWithSkus, ...singleProduct }

    if (product.skus && product.skus.length > 0) {
      product.skus = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        product.skus.map(async (productSku: any) => {
          const updatedSku = await getFullSku(productSku.sku)
          return { ...productSku, ...updatedSku }
        })
      )
    }

    customLog('Product', product)
  }

  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Headers', '*')
  context.set('Access-Control-Allow-Methods', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Content-Type', 'application/json')

  context.body = { product, sku }
  context.status = 200
}

export default synchronizeCatalog
