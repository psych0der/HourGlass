// @flow
import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import queryString from 'qs';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { login, logout } from '../../redux/reducers/auth';
import { FAILED } from '../../commons/constants';
import './index.css';

type Props = {
  location: object,
  auth: object,
  login: () => *,
  logout: () => *,
};
type State = {
  email: string,
  password: string,
};

export class Login extends Component<Props, State> {
  state = {
    email: '',
    password: '',
  };

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = (event: Event) => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  };

  handleSubmit = (event: Event) => {
    event.preventDefault();
    this.props.login({
      email: this.state.email,
      password: this.state.password,
    });
  };

  render() {
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    let message =
      queryStrings.registerSuccess &&
      queryStrings.registerSuccess === 'true' ? (
        <div className="registerSuccess">
          Congratulations! Your account was successfully registered. Login to
          proceed
        </div>
      ) : null;

    if (this.props.auth.status === FAILED) {
      message = (
        <div className="ErrorMessage">
          Unable to Login. Following error occurred:
          <div>{this.props.auth.error}</div>
        </div>
      );
    }

    return (
      <div className="Login">
        {message}
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      login,
      logout,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
