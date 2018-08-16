import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Home, Login, Signup } from './containers';
import { NotFound } from './components';

export default () => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/login" exact component={Login} />
    <Route path="/signup" exact component={Signup} />
    {/* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>
);
