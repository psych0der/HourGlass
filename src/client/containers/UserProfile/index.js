// @flow
import React, { Component } from 'react';
import UserBlock from '../UserBlock';
import { connect } from 'react-redux';
import queryString from 'qs';

// Wrapper around user block
type Props = {
  auth: Object,
  match: Object,
};
type State = {};

export class UserProfile extends Component<Props, State> {
  state = {};

  render() {
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    const userId = this.props.match.params.userId;
    const message =
      queryStrings.edit && queryStrings.edit === 'successful' ? (
        <div className="registerSuccess">
          Congratulations! changes were successfully applied
        </div>
      ) : null;
    return (
      <div>
        <div>{message}</div>
        <UserBlock
          userId={userId}
          proxy={true}
          editLocation={`/users/${userId}/edit`}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(UserProfile);
