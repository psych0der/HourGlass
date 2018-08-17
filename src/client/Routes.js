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
  EditTimeTrack,
  TimeTrackReport,
  UserTimeTracks,
  UserTimeTrackView,
  EditUserTimeTrack,
  CreateUserTimeTrack,
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
      path="/time-track-report/"
      exact
      component={userIsAuthenticatedRedir(TimeTrackReport)}
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
      path="/time-tracks/:timeTrackId/edit"
      exact
      component={userIsAuthenticatedRedir(EditTimeTrack)}
    />
    <Route
      path="/users/:userId/new/time-track"
      exact
      component={userIsSuperAdminRedir(CreateUserTimeTrack)}
    />
    <Route
      path="/users/:userId/time-tracks"
      exact
      component={userIsSuperAdminRedir(UserTimeTracks)}
    />
    <Route
      path="/users/:userId/time-tracks/:timeTrackId"
      exact
      component={userIsSuperAdminRedir(UserTimeTrackView)}
    />
    <Route
      path="/users/:userId/time-tracks/:timeTrackId/edit"
      exact
      component={userIsSuperAdminRedir(EditUserTimeTrack)}
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
