import React, { FC, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Card, Input, InputButton, Layout, PageBlock, PageHeader, Textarea, Toggle } from 'vtex.styleguide';
import './styles.global.css';

const AdminCatalogSynchronizer: FC = () => {
  const [state, setState] = useState({
    nostoIntegrationEnabled: true,
    nostoAccountID: '',
    nostoToken: '',
    algoliaIntegrationEnabled: false,
    algoliaApplicationID: '',
    algoliaAPIKey: '',
    productIDToForceSynchronization: '',
    loggingText: 'logging starts here...\n',
  });

  const updateNostoAccountID = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setState((prevState) => ({ ...prevState, nostoAccountID: value }));
  };

  const updateNostoToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setState((prevState) => ({ ...prevState, nostoToken: value }));
  };

  const updateAlgoliaApplicationID = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setState((prevState) => ({ ...prevState, algoliaApplicationID: value }));
  };

  const updateAlgoliaAPIKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setState((prevState) => ({ ...prevState, algoliaAPIKey: value }));
  };

  const updateProductIDToForceSynchronization = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setState((prevState) => ({ ...prevState, productIDToForceSynchronization: value }));
  };

  const initiateForcedSynchronization = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (state.productIDToForceSynchronization) {
      setState((prevState) => ({
        ...prevState,
        loggingText:
          prevState.loggingText +
          `Started product id "${state.productIDToForceSynchronization}" forced synchronization...\n`,
        productIDToForceSynchronization: '',
      }));
    }
  };

  const saveNostoConfiguration = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    setState((prevState) => ({
      ...prevState,
      loggingText:
        prevState.loggingText + `Nosto Configuration saved.\n`,
    }));

  };

  const saveAlgoliaConfiguration = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    setState((prevState) => ({
      ...prevState,
      loggingText:
        prevState.loggingText + `Algolia Configuration saved.\n`,
    }));

  };

  return (
    <Layout
      pageHeader={<PageHeader title={<FormattedMessage id="admin-catalogsynchronizer.hello-world" />} />}
    >
      <PageBlock variation="full">
        <Card>
          <h3>Recent Logs</h3>
          <Textarea disabled label="Events" value={state.loggingText}>
            Logging starts
          </Textarea>
        </Card>
        <Card>
          <h3>Force Product Synchronization</h3>
          <div>
            <form onSubmit={initiateForcedSynchronization}>
              <InputButton
                label="Product ID to force synchronization"
                size="regular"
                button="Synchronize Now"
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
              label={state.nostoIntegrationEnabled ? 'Nosto Integration Activated' : 'Nosto Integration Deactivated'}
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
            <Button variation="primary" size="small" onClick={saveNostoConfiguration}>
              Save Nosto Configuration
            </Button>
          </div>
        </Card>
        <Card>
          <h3>Algolia Integration</h3>
          <div>
            <Toggle
              label={state.algoliaIntegrationEnabled ? 'Algolia Integration Activated' : 'Algolia Integration Deactivated'}
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
            <Button variation="primary" size="small" onClick={saveAlgoliaConfiguration}>
              Save Algolia Configuration
            </Button>
          </div>
        </Card>
      </PageBlock>
    </Layout>
  );
};

export default AdminCatalogSynchronizer;
