import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Switch, Route } from "react-router-dom";

import { configureStore } from './store';
import { history } from 'store/configure';
import config from 'services/config';
import Playground from 'components/pages/Playground';
import NotFoundPage from "components/pages/NotFoundPage";
import ConnectedThemeProvider from 'components/utils/ConnectedThemeProvider';
import './App.css';

// Configure store and import config from localStorage
const store = configureStore();
config.sync();

const App = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ConnectedThemeProvider className="App">
          <Switch>
            <Route
              path={[
                "/",
                "/snippet/:snippetID"
              ]}
              exact
              component={Playground}
            />
            <Route path="*" component={NotFoundPage}/>
          </Switch>
        </ConnectedThemeProvider>
      </ConnectedRouter>
    </Provider>
  );
}

export default App;
