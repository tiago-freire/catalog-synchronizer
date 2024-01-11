import React, { FC, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Button,
  Card,
  Input,
  InputButton,
  Layout,
  PageBlock,
  PageHeader,
  Textarea,
  Toggle,
} from 'vtex.styleguide'

import { useForceSynchronization, withQueryProvider } from './services'
import './styles.global.css'

const moveTextareaCursorToEnd = (textarea?: HTMLTextAreaElement) => {
  window.setTimeout(() => {
    textarea?.removeAttribute('disabled')
    textarea?.focus()
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length)
    textarea?.setAttribute('disabled', '')
  }, 100)
}

const DEFAULT_LOGGING_TEXT = 'logging starts here...\n'

const AdminCatalogSynchronizer: FC = () => {
  const [state, setState] = useState({
    nostoIntegrationEnabled: true,
    nostoAccountID: '',
    nostoToken: '',
    algoliaIntegrationEnabled: false,
    algoliaApplicationID: '',
    algoliaAPIKey: '',
    productIDToForceSynchronization: '',
    loggingText: DEFAULT_LOGGING_TEXT,
  })

  const updateNostoAccountID = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setState((prevState) => ({ ...prevState, nostoAccountID: value }))
  }

  const updateNostoToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setState((prevState) => ({ ...prevState, nostoToken: value }))
  }

  const updateAlgoliaApplicationID = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target
    setState((prevState) => ({ ...prevState, algoliaApplicationID: value }))
  }

  const updateAlgoliaAPIKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setState((prevState) => ({ ...prevState, algoliaAPIKey: value }))
  }

  const updateProductIDToForceSynchronization = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target
    setState((prevState) => ({
      ...prevState,
      productIDToForceSynchronization: value,
    }))
  }

  const textareaRef = React.useRef<HTMLTextAreaElement>()

  const logger = (text: string, prefix = '') => {
    setState((prevState) => ({
      ...prevState,
      loggingText: `${
        prevState.loggingText
      }${prefix}${new Date().toLocaleTimeString()} - ${text}\n`,
    }))

    moveTextareaCursorToEnd(textareaRef.current)
  }

  const {
    mutateAsync,
    isLoading: loadingSynchronization,
  } = useForceSynchronization()

  const initiateForcedSynchronization = (
    evt: React.FormEvent<HTMLFormElement>
  ) => {
    evt.preventDefault()
    if (!state.productIDToForceSynchronization) {
      return
    }

    setState((prevState) => ({
      ...prevState,
      productIDToForceSynchronization: '',
    }))

    logger(
      `Started product id "${state.productIDToForceSynchronization}" forced synchronization...`,
      '\n'
    )

    mutateAsync({
      ProductId: state.productIDToForceSynchronization,
    })
      .then((response) => {
        const { product } = response
        const [firstSku] = product?.skus
        const skusLength = product?.skus?.length ?? 0
        const categories = Object.values(firstSku?.ProductCategories)
        const catLength = categories?.length ?? 0

        logger(`Name: ${product?.Name}`)
        logger(
          `${skusLength} SKU${skusLength > 1 ? 's' : ''} found:\n${product?.skus
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ?.map((s: any) => s.Name)
            .join('\n')}`
        )
        logger(
          `Categor${catLength > 1 ? 'ies' : 'y'}: ${categories.join(' > ')}`
        )
        logger(`Best price: ${firstSku?.bestPriceFormated}`)
        logger(
          `Finished product id "${state.productIDToForceSynchronization}" forced synchronization...`
        )
      })
      .catch(logger)
      .finally(() => {
        moveTextareaCursorToEnd(textareaRef.current)
      })
  }

  const saveNostoConfiguration = () => {
    logger('Nosto Configuration saved.', '\n')
    moveTextareaCursorToEnd(textareaRef.current)
  }

  const saveAlgoliaConfiguration = () => {
    logger('Algolia Configuration saved.', '\n')
    moveTextareaCursorToEnd(textareaRef.current)
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={
            <FormattedMessage id="admin-catalogsynchronizer.hello-world" />
          }
        />
      }
    >
      <PageBlock variation="full">
        <Card>
          <h3>Recent Logs</h3>
          <Textarea
            ref={textareaRef}
            disabled
            label="Events"
            value={state.loggingText}
            rows={16}
          >
            Logging starts
          </Textarea>
          <Button
            variation="secondary"
            size="small"
            onClick={() =>
              setState((prevState) => ({
                ...prevState,
                loggingText: DEFAULT_LOGGING_TEXT,
              }))
            }
          >
            Clear Logs
          </Button>
        </Card>
        <Card>
          <h3>Force Product Synchronization</h3>
          <div>
            <form onSubmit={initiateForcedSynchronization}>
              <InputButton
                label="Product ID to force synchronization"
                size="regular"
                button="Synchronize Now"
                isLoading={loadingSynchronization}
                value={state.productIDToForceSynchronization}
                onChange={updateProductIDToForceSynchronization}
              />
            </form>
          </div>
        </Card>
        <Card>
          <h3>Nosto Integration</h3>
          <div>
            <Toggle
              label={
                state.nostoIntegrationEnabled
                  ? 'Nosto Integration Activated'
                  : 'Nosto Integration Deactivated'
              }
              checked={state.nostoIntegrationEnabled}
              onChange={() =>
                setState((prevState) => ({
                  ...prevState,
                  nostoIntegrationEnabled: !prevState.nostoIntegrationEnabled,
                }))
              }
            />
            <br />
            <Input
              label="Nosto Account ID"
              value={state.nostoAccountID}
              onChange={updateNostoAccountID}
              disabled={!state.nostoIntegrationEnabled}
            />
            <br />
            <Input
              label="Nosto API Token"
              value={state.nostoToken}
              onChange={updateNostoToken}
              disabled={!state.nostoIntegrationEnabled}
            />
            <br />
            <Button
              variation="primary"
              size="small"
              onClick={saveNostoConfiguration}
            >
              Save Nosto Configuration
            </Button>
          </div>
        </Card>
        <Card>
          <h3>Algolia Integration</h3>
          <div>
            <Toggle
              label={
                state.algoliaIntegrationEnabled
                  ? 'Algolia Integration Activated'
                  : 'Algolia Integration Deactivated'
              }
              checked={state.algoliaIntegrationEnabled}
              onChange={() =>
                setState((prevState) => ({
                  ...prevState,
                  algoliaIntegrationEnabled: !prevState.algoliaIntegrationEnabled,
                }))
              }
            />
            <br />
            <Input
              label="Algolia Application ID"
              value={state.algoliaApplicationID}
              onChange={updateAlgoliaApplicationID}
              disabled={!state.algoliaIntegrationEnabled}
            />
            <br />
            <Input
              label="Algolia API Key"
              value={state.algoliaAPIKey}
              onChange={updateAlgoliaAPIKey}
              disabled={!state.algoliaIntegrationEnabled}
            />
            <br />
            <Button
              variation="primary"
              size="small"
              onClick={saveAlgoliaConfiguration}
            >
              Save Algolia Configuration
            </Button>
          </div>
        </Card>
      </PageBlock>
    </Layout>
  )
}

export default withQueryProvider(AdminCatalogSynchronizer)
