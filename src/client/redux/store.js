import { createStore, applyMiddleware, compose } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import augmentorMiddleware from './middlewares/augmentorMiddleware';
import createHistory from 'history/createBrowserHistory';
import rootReducer from './reducers';
import { persistStore } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native

export const history = createHistory();

// const persistConfig = {
//   key: 'root',
//   storage,
//   blacklist: ['navigation'],
// };

const initialState = {};
const enhancers = [];
const middleware = [augmentorMiddleware(), routerMiddleware(history)];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
);

// we'll use it later
// const persistedReducer = persistReducer(
//   persistConfig,
//   connectRouter(history)(rootReducer)
// );

export const store = createStore(
  //persistedReducer,
  connectRouter(history)(rootReducer),
  initialState,
  composedEnhancers
);

// enabling hot module replacement
// if (module.hot) {
//   module.hot.accept(() => {
//     // This fetch the new state of the above reducers.
//     const nextRootReducer = require('./reducers');
//     store.replaceReducer(
//       persistReducer(persistConfig, connectRouter(history)(nextRootReducer))
//     );
//   });
// }

export const persistor = persistStore(store);
