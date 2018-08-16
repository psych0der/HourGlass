// @flow
import React from 'react';
import Routes from '../../Routes';
import { AUTH_BLANK_STATE, logout } from '../../redux/reducers/auth';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { Link } from 'react-router-dom';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { store } from '../../redux/store';
import './index.css';

const userIsAuthenticated = connectedAuthWrapper({
  authenticatedSelector: state => state.auth.user !== null,
  authenticatingSelector: state => state.auth.status === IN_PROGRESS,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated',
});

const userIsNotAuthenticated = connectedAuthWrapper({
  authenticatedSelector: state =>
    state.auth.user === null && state.auth.status !== IN_PROGRESS,
  wrapperDisplayName: 'UserIsNotAuthenticated',
});

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
