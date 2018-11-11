// @flow
import React from 'react';
import Routes from '../../Routes';
import { logout } from '../../redux/reducers/auth';
import {
  userIsAuthenticated,
  userIsNotAuthenticated,
} from '../../commons/authWrapper';
import { Link } from 'react-router-dom';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { store } from '../../redux/store';
import './index.css';

// Only show login when the user is not logged in and logout when logged in
// Could have also done this with a single wrapper and `FailureComponent`

const LoginLink = userIsNotAuthenticated(() => (
  <LinkContainer to="/login">
    <NavItem>Login</NavItem>
  </LinkContainer>
));
const SignupLink = userIsNotAuthenticated(() => (
  <LinkContainer to="/signup">
    <NavItem>Signup</NavItem>
  </LinkContainer>
));

const ProfileLink = userIsAuthenticated(() => (
  <LinkContainer to="/profile">
    <NavItem>Profile</NavItem>
  </LinkContainer>
));
// profile
const TimeTrackLinks = userIsAuthenticated(() => (
  <LinkContainer to="/time-tracks">
    <NavItem>Time tracks</NavItem>
  </LinkContainer>
));
const HomeLink = userIsAuthenticated(() => (
  <LinkContainer to="/home">
    <NavItem>Home</NavItem>
  </LinkContainer>
));

const LogoutLink = userIsAuthenticated(() => {
  return <NavItem onClick={() => store.dispatch(logout())}>Logout</NavItem>;
});
type Props = {};
type State = {};

export class App extends React.Component<Props, State> {
  render() {
    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">HourGlass</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Nav>
            <HomeLink />
            <ProfileLink />
            <TimeTrackLinks />
          </Nav>
          <Navbar.Collapse>
            <Nav pullRight>
              <LoginLink />
              <LogoutLink />
              <SignupLink />
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes />
      </div>
    );
  }
}

export default App;
