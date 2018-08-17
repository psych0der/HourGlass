// @flow
import React, { Component } from 'react';
import UserBlock from '../UserBlock';
import { connect } from 'react-redux';

// Wrapper around user block
type Props = {
  auth: object,
};
type State = {};

export class Profile extends Component<Props, State> {
  state = {};

  render() {
    return <UserBlock userId={this.props.auth.user.id} />;
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(Profile);
