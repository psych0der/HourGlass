import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Home, Login, Signup } from './containers';

import {
  connectedRouterRedirect,
  connectedReduxRedirect,
} from 'redux-auth-wrapper/history4/redirect';
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';
import { routerActions } from 'react-router-redux';

import { NotFound } from './components';

const locationHelper = locationHelperBuilder({});
const userIsAuthenticated = connectedReduxRedirect({
  // The url to redirect user to if they fail
  redirectPath: '/login',
  // If selector is true, wrapper will not redirect
  // For example let's check that state contains user data
  authenticatedSelector: state => state.auth.user !== null,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated',
  redirectAction: routerActions.replace,
});

const userIsNotAuthenticated = connectedReduxRedirect({
  // This sends the user either to the query param route if we have one, or to the landing page if none is specified and the user is already logged in
  redirectPath: (state, ownProps) =>
    locationHelper.getRedirectQueryParam(ownProps) || '/timeTracks',
  // This prevents us from adding the query parameter when we send the user away from the login page
  allowRedirectBack: false,
  // If selector is true, wrapper will not redirect
  // So if there is no user data, then we show the page
  authenticatedSelector: state => state.auth.user === null,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsNotAuthenticated',
  redirectAction: routerActions.replace,
});

export default () => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/login" exact component={userIsNotAuthenticated(Login)} />
    <Route path="/signup" exact component={userIsNotAuthenticated(Signup)} />
    <Route path="/timeTracks" exact component={userIsAuthenticated(Home)} />
    {/* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>
);
