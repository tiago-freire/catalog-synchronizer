[![Publish and Deploy App](https://github.com/tiago-freire/catalog-synchronizer/actions/workflows/publish-and-deploy.yml/badge.svg)](https://github.com/tiago-freire/catalog-synchronizer/actions/workflows/publish-and-deploy.yml)

# Catalog Synchronizer

_This App is for demonstration purposes only. DO NOT USE IT IN A PRODUCTION ENVIRONMENT. It has not been tested in high volume situations and has not been properly secured._

This App exposes an EndPoint that must be configured to receive Affiliate calls as if it were an External Marketplace:
https://developers.vtex.com/docs/guides/external-marketplace-integration-new-products

When a catalog change notification is received, the App will forward to a third party service such as Nosto.

### Quickstart

1. Install the App using `vtex install ssesandbox04.catalog-synchronizer@0.x`

2. Configure the Affiliate as described in https://help.vtex.com/en/tutorial/configuring-affiliates--tutorials_187 or by accessing the link /admin/checkout/#/affiliates in your admin instance. Instead of `https://{endpointDoAfiliado}/api/notification/`, use `https://{{workspace}}--{{account}}.myvtex.com/_v/catalogsynchronizer/`

3. Access the `https://{{workspace}}--{{account}}.myvtex.com/admin/catalogsynchronizer/` and follow the instructions on the screen.

### App Images

![Catalog Synchronizer Admin View](catalog-synchronized-admin-screen-01.jpg)
