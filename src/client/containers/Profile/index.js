// @flow
import React, { Component } from 'react';
import UserBlock from '../UserBlock';
import { connect } from 'react-redux';
import queryString from 'qs';

// Wrapper around user block
type Props = {
  auth: object,
};
type State = {};

export class Profile extends Component<Props, State> {
  state = {};

  render() {
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    const message =
      queryStrings.edit && queryStrings.edit === 'successful' ? (
        <div className="registerSuccess">
          Congratulations! Your profile was successfully updated
        </div>
      ) : null;
    return (
      <div>
        <div>{message}</div>
        <UserBlock
          userId={this.props.auth.user.id}
          proxy={false}
          editLocation="/profile/edit"
        />
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(Profile);
