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

  let sku
  let product

  if (IdSku) {
    const [singleSku, skuContext] = await Promise.all([
      catalog.getSkuById(IdSku),
      catalog.getSkuContext(IdSku),
    ])

    sku = { ...singleSku, ...skuContext }
    customLog('SKU', sku)
  }

  const idProduct = ProductId || sku?.ProductId

  if (idProduct) {
    const [singleProduct, productWithSkus] = await Promise.all([
      productClient.get(idProduct),
      productWithSkusClient.get(idProduct),
    ])

    product = { ...productWithSkus, ...singleProduct }
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
