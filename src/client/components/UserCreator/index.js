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
import { IN_PROGRESS, FAILED } from '../../commons/constants';
import './index.css';

type Props = {
  userCreationState: Object,
  createUser: () => *,
  isAdmin: boolean,
  submitString: string, // this is used to customize save button of the form
  loadingString: string,
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
  role: {
    value: string,
    isValid: string | null,
    message: string,
  },
};

/* Reusable component for creating users */
export class UserCreator extends Component<Props, State> {
  state = {
    email: { value: '', isValid: null, message: '' },
    password: { value: '', isValid: null, message: '' },
    confirmPassword: { value: '', isValid: null, message: '' },
    name: { value: '', isValid: null, message: '' },
    preferredWorkingHours: { value: null, isValid: null, message: '' },
    role: { value: '', isValid: null, message: '' },
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
   * @memberof UserCreator
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
   * @memberof UserCreator
   */
  validateEmail = (email: string) => {
    return validator.isEmail(email);
  };
  /**
   * Email val change handler
   * @memberof UserCreator
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
   * @memberof UserCreator
   */
  validatePassword = (password: string) => {
    return password && password.length >= 6;
  };
  /**
   * password value change handler
   * @memberof UserCreator
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
   * @memberof UserCreator
   */
  validateConfirmPassword = (confirmPassword: string) => {
    return this.state.password.value === confirmPassword;
  };
  /**
   * confirm password value change handler
   * @memberof UserCreator
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
   * @memberof UserCreator
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
   * Preferred working houurs value change handler
   * @memberof UserCreator
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
   *
   * helper method to validate role
   * @memberof UserEdit
   */
  validateRole = (role: string) => {
    return true;
  };
  /**
   * role value change handler
   * @memberof UserEdit
   */
  onRoleChange = (event: Event) => {
    const newRoleValue = this.validateRole(event.target.value)
      ? { value: event.target.value, isValid: 'success', message: '' }
      : {
          value: event.target.value,
          isValid: 'error',
          message: 'Invalid role',
        };

    this.setState({ role: newRoleValue });
  };

  /**
   * Validates from and return result if form can be submitted or not
   *
   * @memberof UserCreator
   */
  canProceed = (event: ?Event) => {
    return (
      this.validateEmail(this.state.email.value) &&
      this.validateName(this.state.name.value) &&
      this.validatePassword(this.state.password.value) &&
      this.validateConfirmPassword(this.state.confirmPassword.value) &&
      this.validateRole(this.state.role.value) &&
      this.validatePreferredWorkingHours(this.state.preferredWorkingHours.value)
    );
  };

  /**
   * Handles submit event of the form
   * @memberof UserCreator
   */
  onSubmit = (event: Event) => {
    event.preventDefault();
    const canProceed = this.canProceed();

    if (canProceed) {
      const payload = {
        email: this.state.email.value,
        password: this.state.password.value,
        name: this.state.name.value,
        preferredWorkingHourPerDay: this.state.preferredWorkingHours.value,
      };
      if (this.props.isAdmin) {
        payload['role'] = this.state.role.value;
      }
      this.props.createUser(payload);
    }
  };

  render() {
    const {
      email,
      password,
      confirmPassword,
      name,
      preferredWorkingHours,
      role,
    } = this.state;

    const headerMessage =
      this.props.userCreationState.status === FAILED ? (
        <div className="ErrorMessage">
          Unable to create User. Following error occurred:
          <div>{this.props.userCreationState.error}</div>
        </div>
      ) : null;

    const roleFormElement = this.props.isAdmin ? (
      <FormGroup controlId="role" bsSize="large">
        <ControlLabel>role</ControlLabel>
        <div className="UserBlockValue">
          <FormControl
            componentClass="select"
            controlId="role"
            placeholder="select"
            value={role.value}
            readOnly={!this.props.isAdmin}
            disabled={!this.props.isAdmin}
            onChange={this.onRoleChange}
          >
            <option value="user">user</option>
            <option value="user-manager">user-manager</option>
            <option value="super-admin">super-admin</option>
          </FormControl>
        </div>
      </FormGroup>
    ) : null;

    return (
      <div className="UserCreator">
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
          {roleFormElement}
          <FormGroup
            controlId="preferredWorkingHours"
            bsSize="large"
            validationState={preferredWorkingHours.isValid}
          >
            <ControlLabel>Preferred working hours</ControlLabel>
            <FormControl
              autoFocus
              type="number"
              max={24.0}
              min={0.0}
              step={0.01}
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
            isLoading={this.props.userCreationState.status === IN_PROGRESS}
            text={this.props.submitString}
            loadingText={this.props.loadingString}
          />
        </form>
      </div>
    );
  }
}

export default UserCreator;
