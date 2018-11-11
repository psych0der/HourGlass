// @flow
import React, { Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  PageHeader,
  Label,
  Button,
} from 'react-bootstrap';
import { userIsSuperAdmin } from '../../commons/authWrapper';
import { LinkContainer } from 'react-router-bootstrap';
import { LoaderButton } from '../../components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUserInformation } from '../../redux/reducers/userInfo';
import { IN_PROGRESS, SUCCESS } from '../../commons/constants';
import './index.css';

type Props = {
  userInfo: Object,
  userId: string,
  fetchUserInformation: () => *,
  editLocation: string,
  proxy: boolean,
};
type State = {};

export class UserBlock extends Component<Props, State> {
  componentDidMount() {
    this.props.fetchUserInformation(this.props.userId);
  }

  static defaultProps = {
    proxy: false,
  };

  /* Re trigger request */
  retry = () => {
    this.props.fetchUserInformation(this.props.userId);
  };
  render() {
    const { userInfo } = this.props.userInfo;
    const proxyNotification =
      this.props.proxy === true ? (
        <div className="ProxyNotification">
          You are viewing someone else's profile
        </div>
      ) : null;
    let component = null;
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
      const ManageTimeTrackButton = userIsSuperAdmin(() => (
        <div>
          <LinkContainer to={`/users/${this.props.userId}/time-tracks`}>
            <Button className="pull-right" bsStyle="warning">
              Manage time tracks for this user
            </Button>
          </LinkContainer>
        </div>
      ));
      component = (
        <div className="UserBlockContainer">
          <div className="UserBlock">
            <PageHeader>
              <small>Profile page</small>
              <LinkContainer to={this.props.editLocation}>
                <Button className="pull-right" bsStyle="warning">
                  Edit
                </Button>
              </LinkContainer>
            </PageHeader>
            <div className="UserBlockComponents">
              <FormGroup controlId="name" bsSize="large">
                <ControlLabel className="UserBlockLabel">Name</ControlLabel>
                <div className="UserBlockValue">{userInfo.name}</div>
              </FormGroup>
              <FormGroup controlId="email" bsSize="large">
                <ControlLabel className="UserBlockLabel">Email</ControlLabel>
                <div className="UserBlockValue">{userInfo.email}</div>
              </FormGroup>
              <FormGroup controlId="role" bsSize="large">
                <ControlLabel className="UserBlockLabel">role</ControlLabel>
                <div className="UserBlockValue">
                  <Label bsStyle="primary">{userInfo.role}</Label>
                </div>
              </FormGroup>
              <FormGroup controlId="preferredWorkingHours" bsSize="large">
                <ControlLabel className="UserBlockLabel">
                  Preferred working hours
                </ControlLabel>
                <div className="UserBlockValue">
                  {userInfo.preferredWorkingHourPerDay || 'Not set'}
                </div>
              </FormGroup>
            </div>
            <ManageTimeTrackButton />
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
              onClick={this.retry}
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

const mapStateToProps = ({ userInfo }) => ({ userInfo });

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchUserInformation,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserBlock);
