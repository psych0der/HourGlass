import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Provider as ResinProvider } from 'rendition';
import { ConnectedRouter } from 'connected-react-router';
import store, { history } from './redux/store';
import { App } from './containers';
import registerServiceWorker from './registerServiceWorker';

import './index.css';

const target = document.querySelector('#root');

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ResinProvider>
        <div>
          <App />
        </div>
      </ResinProvider>
    </ConnectedRouter>
  </Provider>,
  target
);

registerServiceWorker();
