import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { store, history } from './redux/store';
import { setCurrentUser } from './redux/reducers/auth';
import { App } from './containers';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import './index.css';

const target = document.querySelector('#root');

// try to fetch user from localstorage
if (localStorage.user) {
  const userObject = JSON.parse(localStorage.user);
  if (new Date(userObject.expiresIn) < new Date()) {
    localStorage.removeItem('user');
  } else {
    store.dispatch(setCurrentUser(userObject));
  }
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <div>
        <App />
      </div>
      {/* </PersistGate> */}
    </ConnectedRouter>
  </Provider>,
  target
);

registerServiceWorker();
