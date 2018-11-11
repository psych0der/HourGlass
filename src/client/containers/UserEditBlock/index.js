// @flow
import React, { Component } from 'react';
import validator from 'validator';
import {
  HelpBlock,
  FormGroup,
  FormControl,
  ControlLabel,
  PageHeader,
} from 'react-bootstrap';
import { LoaderButton } from '../../components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUserInformation } from '../../redux/reducers/userInfo';
import { editUser, deleteUser } from '../../redux/reducers/userEdit';
import { IN_PROGRESS, SUCCESS, FAILED, IDLE } from '../../commons/constants';
import './index.css';

type Props = {
  userInfo: Object,
  userEdit: Object,
  userId: string,
  fetchUserInformation: () => *,
  deleteUser: () => *,
  editUser: () => *,
  isAdmin: boolean,
  proxy: boolean,
  postEditLocation: string,
};
type State = {
  fetchedUserInfo: boolean,
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

export class UserEditBlock extends Component<Props, State> {
  static defaultProps = {
    proxy: false,
  };
  state = {
    fetchedUserInfo: false,
    email: { value: '', isValid: null, message: '' },
    password: { value: '', isValid: null, message: '' },
    confirmPassword: { value: '', isValid: null, message: '' },
    name: { value: '', isValid: null, message: '' },
    preferredWorkingHours: { value: null, isValid: null, message: '' },
    role: { value: '', isValid: null, message: '' },
  };

  componentDidMount() {
    this.props.fetchUserInformation(this.props.userId);
  }

  componentDidUpdate(prevProps: Props) {
    //update internal state on prop change
    if (!this.state.fetchedUserInfo && this.props.userInfo.status === SUCCESS) {
      this.setState({
        fetchedUserInfo: true,
        email: {
          ...this.state.email,
          value: this.props.userInfo.userInfo.email,
        },
        name: {
          ...this.state.email,
          value: this.props.userInfo.userInfo.name,
        },
        preferredWorkingHours: {
          ...this.state.preferredWorkingHours,
          value: this.props.userInfo.userInfo.preferredWorkingHourPerDay,
        },
        role: {
          ...this.state.role,
          value: this.props.userInfo.userInfo.role,
        },
      });
    }
  }

  /* Re trigger request */
  retryFetch = () => {
    this.props.fetchUserInformation(this.props.userId);
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
   * @memberof UserEdit
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
   * @memberof UserEdit
   */
  validateEmail = (email: string) => {
    return validator.isEmail(email);
  };
  /**
   * Email val change handler
   * @memberof UserEdit
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
   * @memberof UserEdit
   */
  validatePassword = (password: string) => {
    return !password || (password && password.length) >= 6;
  };
  /**
   * password value change handler
   * @memberof UserEdit
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
   * @memberof UserEdit
   */
  validateConfirmPassword = (confirmPassword: string) => {
    return this.state.password.value === confirmPassword;
  };
  /**
   * confirm password value change handler
   * @memberof UserEdit
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
   * @memberof UserEdit
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
   * Preferred working hours value change handler
   * @memberof UserEdit
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
   * @memberof UserEdit
   */
  canProceed = (event: ?Event) => {
    return (
      this.validateEmail(this.state.email.value) &&
      this.validateName(this.state.name.value) &&
      this.validatePassword(this.state.password.value) &&
      this.validateRole(this.state.role.value) &&
      this.validateConfirmPassword(this.state.confirmPassword.value) &&
      this.validatePreferredWorkingHours(this.state.preferredWorkingHours.value)
    );
  };

  onSubmit = (event: Event) => {
    event.preventDefault();
    const canProceed = this.canProceed();

    if (canProceed) {
      const payload = {
        password: this.state.password.value,
        name: this.state.name.value,
        preferredWorkingHourPerDay: this.state.preferredWorkingHours.value,
        targetLocation: this.props.postEditLocation,
        userId: this.props.userId,
      };
      if (this.props.isAdmin) {
        payload['role'] = this.state.role.value;
        payload['email'] = this.state.email.value;
      }
      this.props.editUser(payload, !this.props.proxy);
    }
  };
  render() {
    const proxyNotification =
      this.props.proxy === true ? (
        <div className="ProxyNotification">
          You are editing someone else's profile
        </div>
      ) : null;

    let deleteButton = null;
    if (this.props.isAdmin) {
      if (this.props.userEdit.deleteStatus === IN_PROGRESS) {
        deleteButton = (
          <LoaderButton
            block
            bsSize="large"
            bsStyle="danger"
            disabled={true}
            type="submit"
            isLoading={true}
            text="Deleting user...."
            loadingText="Deleting user..."
          />
        );
      } else if (this.props.userEdit.deleteStatus === IDLE) {
        deleteButton = (
          <LoaderButton
            block
            bsSize="large"
            bsStyle="danger"
            disabled={false}
            type="submit"
            isLoading={false}
            text="Delete user"
            loadingText="Deleting user...."
            onClick={() => this.props.deleteUser(this.props.userId, '/users')}
          />
        );
      }
    }
    const { status: userEditStatus } = this.props.userEdit;
    const {
      email,
      password,
      confirmPassword,
      name,
      preferredWorkingHours,
      role,
    } = this.state;
    let component = null;
    const headerMessage =
      userEditStatus === FAILED ? (
        <div className="ErrorMessage">
          Unable to update user info. Following error occurred:
          <div>userEditError}</div>
        </div>
      ) : null;

    if (this.props.userInfo.status === IN_PROGRESS) {
      component = (
        <LoaderButton
          block
          bsSize="large"
          disabled={true}
          type="submit"
          isLoading={true}
          text="Loading user info..."
          loadingText="Loading user info..."
        />
      );
    } else if (this.props.userInfo.status === SUCCESS) {
      component = (
        <div className="UserBlockContainer">
          <div className="UserBlock">
            <PageHeader>
              <small>Edit Profile</small>
            </PageHeader>
            {headerMessage}
            <form onSubmit={this.onSubmit}>
              <div className="UserBlockComponents">
                <FormGroup controlId="name" bsSize="large">
                  <ControlLabel>Name</ControlLabel>
                  <FormControl
                    autoFocus
                    type="text"
                    value={name.value}
                    onChange={this.onNameChange}
                  />
                  <HelpBlock>{name.message}</HelpBlock>
                </FormGroup>
                <FormGroup controlId="email" bsSize="large">
                  <ControlLabel>Email</ControlLabel>
                  <FormControl
                    readOnly={!this.props.isAdmin}
                    autoFocus
                    type="email"
                    value={email.value}
                    onChange={this.onEmailChange}
                  />
                  <HelpBlock>{email.message}</HelpBlock>
                </FormGroup>
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
                <FormGroup controlId="preferredWorkingHours" bsSize="large">
                  <ControlLabel>Preferred working hours</ControlLabel>
                  <div className="UserBlockValue">
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
                  </div>
                </FormGroup>
                <FormGroup
                  controlId="password"
                  bsSize="large"
                  validationState={password.isValid}
                >
                  <ControlLabel>New Password</ControlLabel>
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
                <LoaderButton
                  block
                  bsSize="large"
                  bsStyle="primary"
                  disabled={!this.canProceed()}
                  type="submit"
                  isLoading={false}
                  text="update"
                  loadingText="Updating"
                />
                {deleteButton}
              </div>
            </form>
          </div>
        </div>
      );
    } else {
      /* show error notification */
      component = (
        <div className="ErrorMessage">
          <div>Unable to fetch user information</div>
          <div>{this.props.userInfo.error}</div>
          <div style={{ width: 100, margin: '0 auto', marginTop: '10px' }}>
            <LoaderButton
              block
              bsSize="small"
              disabled={false}
              type="button"
              isLoading={false}
              text="Retry"
              loadingText=""
              onClick={this.retryFetch}
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div>{proxyNotification}</div>
        <div>{component}</div>
      </div>
    );
  }
}

const mapStateToProps = ({
  userInfo,
  userEdit,
}: {
  userInfo: Object,
  userEdit: Object,
}) => ({ userInfo, userEdit });

// connect redux to the container
const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchUserInformation,
      editUser,
      deleteUser,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserEditBlock);
