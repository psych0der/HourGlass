// @flow
import React, { Component } from 'react';
import UserEditBlock from '../UserEditBlock';
import { SUPER_ADMIN } from '../../commons/constants';
import { connect } from 'react-redux';

// Wrapper around user block
type Props = {
  auth: object,
};
type State = {};

export class EditProfile extends Component<Props, State> {
  state = {};

  render() {
    return (
      <UserEditBlock
        userId={this.props.auth.user.id}
        postEditLocation="/profile"
        proxy={false}
        isAdmin={
          ['user_manager', SUPER_ADMIN].indexOf(this.props.auth.user.role) > -1
        }
      />
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(EditProfile);
