import React, { FC, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
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

import {
  useForceSynchronization,
  useSettings,
  withQueryProvider,
} from './services'

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
  const { formatMessage } = useIntl()

  const {
    getSettings: { data: settings, isLoading: loadingGetSettings },
    mutationUpdateSettings: {
      mutateAsync: updateSettings,
      isLoading: loadingUpdateSettings,
    },
  } = useSettings()

  const [state, setState] = useState({
    nostoIntegrationEnabled: false,
    nostoAccountID: '',
    nostoToken: '',
    algoliaIntegrationEnabled: false,
    algoliaApplicationID: '',
    algoliaAPIKey: '',
    productIDToForceSynchronization: '',
    loggingText: DEFAULT_LOGGING_TEXT,
  })

  useEffect(() => {
    if (settings && !loadingGetSettings) {
      setState((prevState) => ({
        ...prevState,
        nostoIntegrationEnabled: settings.nostoIntegrationEnabled ?? false,
        nostoAccountID: settings.nostoAccountID ?? '',
        nostoToken: settings.nostoToken ?? '',
        algoliaIntegrationEnabled: settings.algoliaIntegrationEnabled ?? false,
        algoliaApplicationID: settings.algoliaApplicationID ?? '',
        algoliaAPIKey: settings.algoliaAPIKey ?? '',
      }))
    }
  }, [loadingGetSettings, settings])

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
    mutateAsync: forceSynchronization,
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

    forceSynchronization({
      ProductId: state.productIDToForceSynchronization,
    })
      .then((response) => {
        if (response.nostoProduct) {
          logger(
            `Product updated at Nosto: ${JSON.stringify(response.nostoProduct)}`
          )
          logger(`Nosto response: ${JSON.stringify(response.nostoResponse)}`)
        }

        if (response.algoliaProduct) {
          logger(
            `Product updated at Algolia: ${JSON.stringify(
              response.algoliaProduct
            )}`
          )
          logger(
            `Algolia response: ${JSON.stringify(response.algoliaResponse)}`
          )
        }

        logger(
          `Finished product id "${state.productIDToForceSynchronization}" forced synchronization successfully!`
        )
      })
      .catch((e) => {
        logger(
          `Finished product id "${state.productIDToForceSynchronization}" forced synchronization with errors!`
        )
        logger(e)
      })
  }

  const saveNostoConfiguration = () => {
    updateSettings({
      nostoIntegrationEnabled: state.nostoIntegrationEnabled,
      nostoAccountID: state.nostoAccountID,
      nostoToken: state.nostoToken,
    })
      .then(() => {
        logger('Nosto Configuration saved.', '\n')
      })
      .catch(logger)
  }

  const saveAlgoliaConfiguration = () => {
    updateSettings({
      algoliaIntegrationEnabled: state.algoliaIntegrationEnabled,
      algoliaAPIKey: state.algoliaAPIKey,
      algoliaApplicationID: state.algoliaApplicationID,
    })
      .then(() => {
        logger('Algolia Configuration saved.', '\n')
      })
      .catch(logger)
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={`${formatMessage({
            id: 'admin-catalogsynchronizer.hello-world',
          })} v${process.env.VTEX_APP_VERSION}`}
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
              disabled={loadingGetSettings}
            />
            <br />
            <Input
              label="Nosto Account ID"
              value={state.nostoAccountID}
              onChange={updateNostoAccountID}
              placeholder={loadingGetSettings ? 'Loading...' : ''}
              disabled={!state.nostoIntegrationEnabled || loadingGetSettings}
            />
            <br />
            <Input
              label="Nosto API Token"
              value={state.nostoToken}
              onChange={updateNostoToken}
              placeholder={loadingGetSettings ? 'Loading...' : ''}
              disabled={!state.nostoIntegrationEnabled || loadingGetSettings}
            />
            <br />
            <Button
              variation="primary"
              size="small"
              onClick={saveNostoConfiguration}
              isLoading={loadingGetSettings || loadingUpdateSettings}
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
              disabled={loadingGetSettings}
            />
            <br />
            <Input
              label="Algolia Application ID"
              value={state.algoliaApplicationID}
              onChange={updateAlgoliaApplicationID}
              placeholder={loadingGetSettings ? 'Loading...' : ''}
              disabled={!state.algoliaIntegrationEnabled || loadingGetSettings}
            />
            <br />
            <Input
              label="Algolia API Key"
              value={state.algoliaAPIKey}
              onChange={updateAlgoliaAPIKey}
              placeholder={loadingGetSettings ? 'Loading...' : ''}
              disabled={!state.algoliaIntegrationEnabled || loadingGetSettings}
            />
            <br />
            <Button
              variation="primary"
              size="small"
              onClick={saveAlgoliaConfiguration}
              isLoading={loadingGetSettings || loadingUpdateSettings}
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
