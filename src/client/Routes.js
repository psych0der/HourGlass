import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Home } from './containers';
import { NotFound } from './components';

export default () => (
  <Switch>
    <Route path="/" exact component={Home} />
    {/* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>
);
