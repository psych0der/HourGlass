// @flow
import React from 'react';
import {
  userIsAuthenticated,
  userIsSuperAdminOrUserManager,
} from '../../commons/authWrapper';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './index.css';
type Props = {};
type State = {};

const ManageUsersButton = userIsSuperAdminOrUserManager(() => (
  <LinkContainer to="/users">
    <Button bsStyle="warning">Manage users</Button>
  </LinkContainer>
));

const ManageTimeTracksButton = userIsAuthenticated(() => (
  <LinkContainer to="/time-tracks">
    <Button bsStyle="primary">Manage Time tracks</Button>
  </LinkContainer>
));

export class Home extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <div className="Home">
        <div className="lander">
          <h1>HourGlass</h1>
          <p>A simple time management app</p>
          <div className="HomeActions">
            <div>
              <ManageUsersButton />
            </div>
            <div className="mtop2">
              <ManageTimeTracksButton />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
