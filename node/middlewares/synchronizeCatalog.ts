import {
  ForbiddenError,
  LogLevel,
  NotFoundError,
  ServiceContext,
  log,
} from '@vtex/api'
import { json } from 'co-body'

import { Clients } from '../clients'

const synchronizeCatalog = async (context: ServiceContext<Clients, State>) => {
  const {
    req,
    clients: {
      catalog,
      segment,
      nostoClient,
      productClient,
      productWithSkusClient,
    },
    state: {
      settings: { nostoIntegrationEnabled, algoliaIntegrationEnabled },
    },
  } = context

  if (!nostoIntegrationEnabled && !algoliaIntegrationEnabled) {
    throw new ForbiddenError('No integration is enabled')
  }

  const payload = await json(req)

  log(`Syncronize catalog payload: ${JSON.stringify(payload)}`, LogLevel.Info)

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
        product.skus.map(async (productSku: { sku: string }) => {
          const updatedSku = await getFullSku(productSku.sku)
          return { ...productSku, ...updatedSku }
        })
      )
    }
  }

  let nostoProduct
  let algoliaProduct

  if (nostoIntegrationEnabled) {
    const { currencyCode } = await segment.getSegment()
    nostoProduct = nostoClient.converter({ product, sku, currencyCode })
    await nostoClient.updateProduct(nostoProduct)
  }

  if (algoliaIntegrationEnabled) {
    // TODO: Implement algolia synchronization
  }

  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Headers', '*')
  context.set('Access-Control-Allow-Methods', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Content-Type', 'application/json')
  context.body = { product, sku, nostoProduct, algoliaProduct }
  context.status = 200
}

export default synchronizeCatalog
