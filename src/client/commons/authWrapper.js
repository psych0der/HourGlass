/**
 * This module defines common auth wrappers and redirects to ease auth management while visiting routes
 */

import { IN_PROGRESS, SUPER_ADMIN, USER_MANAGER } from './constants';
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper';

import { connectedReduxRedirect } from 'redux-auth-wrapper/history4/redirect';
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper';
import { routerActions } from 'react-router-redux';

const locationHelper = locationHelperBuilder({});

// HOCs for redirects
export const userIsAuthenticatedRedir = connectedReduxRedirect({
  // The url to redirect user to if they fail
  redirectPath: '/login',
  // If selector is true, wrapper will not redirect
  // For example let's check that state contains user data
  authenticatedSelector: state => state.auth.user !== null,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated',
  redirectAction: routerActions.replace,
});

export const userIsNotAuthenticatedRedir = connectedReduxRedirect({
  // This sends the user either to the query param route if we have one, or to the landing page if none is specified and the user is already logged in
  redirectPath: (state, ownProps) =>
    locationHelper.getRedirectQueryParam(ownProps) || '/home',
  // This prevents us from adding the query parameter when we send the user away from the login page
  allowRedirectBack: false,
  // If selector is true, wrapper will not redirect
  // So if there is no user data, then we show the page
  authenticatedSelector: state => state.auth.user === null,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsNotAuthenticated',
  redirectAction: routerActions.replace,
});

export const userIsSuperAdminRedir = connectedReduxRedirect({
  redirectPath: '/home',
  allowRedirectBack: false,
  authenticatedSelector: state =>
    state.auth.user !== null && state.auth.user.role === SUPER_ADMIN,
  predicate: user => user.role === SUPER_ADMIN,
  wrapperDisplayName: 'UserIsSuperAdmin',
  redirectAction: routerActions.replace,
});

export const userIsSuperAdminOrUserManagerRedir = connectedReduxRedirect({
  redirectPath: '/home',
  allowRedirectBack: false,
  authenticatedSelector: state =>
    state.auth.user !== null &&
    [SUPER_ADMIN, USER_MANAGER].indexOf(state.auth.user.role) > -1,
  predicate: user => [SUPER_ADMIN, USER_MANAGER].indexOf(user.role) > -1,
  wrapperDisplayName: 'UserIsSuperAdminOrUserManager',
  redirectAction: routerActions.replace,
});

// Auth wrapper to determine auth state
export const userIsAuthenticated = connectedAuthWrapper({
  authenticatedSelector: state => state.auth.user !== null,
  authenticatingSelector: state => state.auth.status === IN_PROGRESS,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated',
});

export const userIsNotAuthenticated = connectedAuthWrapper({
  authenticatedSelector: state =>
    state.auth.user === null && state.auth.status !== IN_PROGRESS,
  wrapperDisplayName: 'UserIsNotAuthenticated',
});

export const userIsSuperAdmin = connectedAuthWrapper({
  authenticatedSelector: state =>
    state.auth.user !== null && state.auth.user.role === SUPER_ADMIN,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsSuperAdmin',
});

export const userIsSuperAdminOrUserManager = connectedAuthWrapper({
  authenticatedSelector: state =>
    state.auth.user !== null &&
    [SUPER_ADMIN, USER_MANAGER].indexOf(state.auth.user.role) > -1,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsSuperAdminOrManager',
});
