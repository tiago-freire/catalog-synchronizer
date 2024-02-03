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
      algoliaClient,
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

  const { currencyCode } = await segment.getSegment()
  const apiProduct = nostoClient.converter({ product, sku, currencyCode })

  let nostoProduct
  let nostoResponse
  let algoliaProduct
  let algoliaResponse
  const errors: string[] = []

  // Nosto synchronization
  if (nostoIntegrationEnabled) {
    nostoProduct = { ...apiProduct }
    nostoResponse = await nostoClient
      .updateProduct(nostoProduct)
      .catch((error) => {
        errors.push(error.message)
      })
  }

  // Algolia synchronization
  if (algoliaIntegrationEnabled) {
    algoliaProduct = { ...apiProduct, objectID: apiProduct.product_id }
    algoliaResponse = await algoliaClient
      .updateProduct(algoliaProduct)
      .catch((error) => {
        errors.push(error.message)
      })
  }

  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Headers', '*')
  context.set('Access-Control-Allow-Methods', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Content-Type', 'application/json')
  context.body = {
    product,
    sku,
    nostoProduct,
    nostoResponse,
    algoliaProduct,
    algoliaResponse,
    errors,
  }
  context.status = 200
}

export default synchronizeCatalog
