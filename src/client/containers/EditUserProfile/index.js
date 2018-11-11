// @flow
import React, { Component } from 'react';
import UserEditBlock from '../UserEditBlock';
import { SUPER_ADMIN } from '../../commons/constants';
import { connect } from 'react-redux';

// Wrapper around user block
type Props = {
  auth: object,
  match: object,
};
type State = {};

/* This container is used to edit other users' profiles */
export class EditUserProfile extends Component<Props, State> {
  state = {};

  render() {
    const userId = this.props.match.params.userId;
    return (
      <UserEditBlock
        userId={userId}
        proxy={true}
        isAdmin={
          ['user_manager', SUPER_ADMIN].indexOf(this.props.auth.user.role) > -1
        }
        postEditLocation={`/users/${userId}`}
      />
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(EditUserProfile);
