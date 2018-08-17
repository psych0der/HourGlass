import React from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  Home,
  Login,
  Signup,
  Profile,
  EditProfile,
  EditUserProfile,
  Users,
  UserProfile,
  CreateUser,
  CreateMyTimeTrack,
  MyTimeTracks,
  TimeTrackView,
} from './containers';

import {
  userIsAuthenticatedRedir,
  userIsNotAuthenticatedRedir,
  userIsSuperAdminOrUserManagerRedir,
  userIsSuperAdminRedir,
} from './commons/authWrapper';

import { NotFound, Landing } from './components';

export default () => (
  <Switch>
    <Route path="/" exact component={Landing} />
    <Route path="/login" exact component={userIsNotAuthenticatedRedir(Login)} />
    <Route
      path="/signup"
      exact
      component={userIsNotAuthenticatedRedir(Signup)}
    />
    <Route path="/home" exact component={userIsAuthenticatedRedir(Home)} />
    <Route
      path="/new/user/"
      exact
      component={userIsSuperAdminOrUserManagerRedir(CreateUser)}
    />
    <Route
      path="/new/time-track/"
      exact
      component={userIsAuthenticatedRedir(CreateMyTimeTrack)}
    />
    <Route
      path="/time-tracks/"
      exact
      component={userIsAuthenticatedRedir(MyTimeTracks)}
    />
    <Route
      path="/time-tracks/:timeTrackId"
      exact
      component={userIsAuthenticatedRedir(TimeTrackView)}
    />
    <Route
      path="/users/:userId/edit"
      exact
      component={userIsSuperAdminOrUserManagerRedir(EditUserProfile)}
    />
    <Route
      path="/users/:userId"
      exact
      component={userIsSuperAdminOrUserManagerRedir(UserProfile)}
    />
    <Route
      path="/profile"
      exact
      component={userIsAuthenticatedRedir(Profile)}
    />
    <Route
      path="/profile/edit"
      exact
      component={userIsAuthenticatedRedir(EditProfile)}
    />
    <Route
      path="/users"
      exact
      component={userIsSuperAdminOrUserManagerRedir(Users)}
    />
    {/* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>
);
