// @flow
import React, { Component } from 'react';
import validator from 'validator';
import {
  HelpBlock,
  FormGroup,
  FormControl,
  ControlLabel,
} from 'react-bootstrap';
import { LoaderButton } from '../../components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { registerUser } from '../../redux/reducers/register';
import { IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import './index.css';

type Props = {
  registerationState: Object,
  registerUser: () => *,
};
type State = {
  email: { value: string, isValid: string | null, message: string },
  password: { value: string, isValid: string | null, message: string },
  confirmPassword: {
    value: string,
    isValid: string | null,
    message: string,
  },
  name: { value: string, isValid: string | null, message: string },
  preferredWorkingHours: {
    value: ?number,
    isValid: string | null,
    message: string,
  },
};

export class Signup extends Component<Props, State> {
  state = {
    email: { value: '', isValid: null, message: '' },
    password: { value: '', isValid: null, message: '' },
    confirmPassword: { value: '', isValid: null, message: '' },
    name: { value: '', isValid: null, message: '' },
    preferredWorkingHours: { value: null, isValid: null, message: '' },
  };

  /**
   * Validate name field
   */
  validateName = (name: ?string) => {
    return name && name.length > 0;
  };
  /**
   * handles name value change
   *
   * @memberof Signup
   */
  onNameChange = (event: Event) => {
    const newNamevalue = this.validateName(event.target.value)
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'Name should be a non empty string',
        };

    this.setState({ name: newNamevalue });
  };

  /**
   *
   * helper method to validate if string is a valid emal
   * @memberof Signup
   */
  validateEmail = (email: string) => {
    return validator.isEmail(email);
  };
  /**
   * Email val change handler
   * @memberof Signup
   */
  onEmailChange = (event: Event) => {
    const newEmailvalue = this.validateEmail(event.target.value)
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'This is not a valid email format',
        };

    this.setState({ email: newEmailvalue });
  };

  /**
   *
   * helper method to validate password
   * @memberof Signup
   */
  validatePassword = (password: string) => {
    return password && password.length >= 6;
  };
  /**
   * password value change handler
   * @memberof Signup
   */
  onPasswordChange = (event: Event) => {
    const newPasswordvalue = this.validatePassword(event.target.value)
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'Password should atleast be 5 chars long',
        };

    this.setState({ password: newPasswordvalue });
  };

  /**
   *
   * helper method to validate confirm password
   * @memberof Signup
   */
  validateConfirmPassword = (confirmPassword: string) => {
    return this.state.password.value === confirmPassword;
  };
  /**
   * confirm password value change handler
   * @memberof Signup
   */
  onConfirmPasswordChange = (event: Event) => {
    const newConfirmPasswordvalue = this.validateConfirmPassword(
      event.target.value
    )
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'Passwords should match',
        };

    this.setState({ confirmPassword: newConfirmPasswordvalue });
  };

  /**
   *
   * helper method to validate confirm password
   * @memberof Signup
   */
  validatePreferredWorkingHours = (preferredWorkingHours: ?number) => {
    return (
      !preferredWorkingHours ||
      (!isNaN(parseFloat(preferredWorkingHours)) &&
        isFinite(preferredWorkingHours) &&
        parseFloat(preferredWorkingHours) >= parseFloat(0) &&
        parseFloat(preferredWorkingHours) <= parseFloat(24))
    );
  };
  /**
   * confirm password value change handler
   * @memberof Signup
   */
  onPreferredWorkingHoursChange = (event: Event) => {
    const newPreferredWorkingHoursValue = this.validatePreferredWorkingHours(
      event.target.value
    )
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'Preferred working hours should be between 0 and 24',
        };

    this.setState({ preferredWorkingHours: newPreferredWorkingHoursValue });
  };

  /**
   * Validates from and return result if form can be submitted or not
   *
   * @memberof Signup
   */
  canProceed = (event: ?Event) => {
    return (
      this.validateEmail(this.state.email.value) &&
      this.validateName(this.state.name.value) &&
      this.validatePassword(this.state.password.value) &&
      this.validateConfirmPassword(this.state.confirmPassword.value) &&
      this.validatePreferredWorkingHours(this.state.preferredWorkingHours.value)
    );
  };

  /**
   * Handles submit event of the form
   * @memberof Signup
   */
  onSubmit = (event: Event) => {
    event.preventDefault();
    const canProceed = this.canProceed();

    if (canProceed) {
      this.props.registerUser({
        email: this.state.email.value,
        password: this.state.password.value,
        name: this.state.name.value,
        preferredWorkingHours: this.state.preferredWorkingHours.value,
      });
    }
  };

  render() {
    const {
      email,
      password,
      confirmPassword,
      name,
      preferredWorkingHours,
    } = this.state;

    const headerMessage =
      this.props.registerationState.status == FAILED ? (
        <div className="ErrorMessage">
          Unable to register. Following error occurred:
          <div>{this.props.registerationState.error}</div>
        </div>
      ) : null;

    return (
      <div className="Signup">
        {headerMessage}
        <form onSubmit={this.onSubmit}>
          <FormGroup
            controlId="name"
            bsSize="large"
            validationState={name.isValid}
          >
            <ControlLabel>Name</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={name.value}
              onChange={this.onNameChange}
            />
            <HelpBlock>{name.message}</HelpBlock>
          </FormGroup>
          <FormGroup
            controlId="email"
            bsSize="large"
            validationState={email.isValid}
          >
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={email.value}
              onChange={this.onEmailChange}
            />
            <HelpBlock>{email.message}</HelpBlock>
          </FormGroup>
          <FormGroup
            controlId="password"
            bsSize="large"
            validationState={password.isValid}
          >
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={password.value}
              onChange={this.onPasswordChange}
              type="password"
            />
            <HelpBlock>{password.message}</HelpBlock>
          </FormGroup>
          <FormGroup
            controlId="confirmPassword"
            bsSize="large"
            validationState={confirmPassword.isValid}
          >
            <ControlLabel>Confirm Password</ControlLabel>
            <FormControl
              value={confirmPassword.value}
              onChange={this.onConfirmPasswordChange}
              type="password"
            />
            <HelpBlock>{confirmPassword.message}</HelpBlock>
          </FormGroup>
          <FormGroup
            controlId="preferredWorkingHours"
            bsSize="large"
            validationState={preferredWorkingHours.isValid}
          >
            <ControlLabel>Preferred working hours</ControlLabel>
            <FormControl
              autoFocus
              type="number"
              max={24}
              min={0}
              value={preferredWorkingHours.value}
              onChange={this.onPreferredWorkingHoursChange}
            />
            <HelpBlock>{preferredWorkingHours.message}</HelpBlock>
          </FormGroup>
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.canProceed()}
            type="submit"
            isLoading={this.props.registerationState.state == IN_PROGRESS}
            text="Signup"
            loadingText="Signing up…"
          />
        </form>
      </div>
    );
  }
}

const mapStateToProps = ({ register }) => ({ registerationState: register });

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      registerUser,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup);
