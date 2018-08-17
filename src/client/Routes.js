import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Home, Login, Signup } from './containers';

import {
  userIsAuthenticatedRedir,
  userIsNotAuthenticatedRedir,
} from './commons/authWrapper';

import { NotFound } from './components';

export default () => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/login" exact component={userIsNotAuthenticatedRedir(Login)} />
    <Route
      path="/signup"
      exact
      component={userIsNotAuthenticatedRedir(Signup)}
    />
    <Route
      path="/timeTracks"
      exact
      component={userIsAuthenticatedRedir(Home)}
    />
    {/* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>
);
