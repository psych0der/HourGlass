// @flow
import React, { Component } from 'react';
import TimeTrackBlock from '../TimeTrackBlock';
import { connect } from 'react-redux';

// Wrapper around user block
type Props = {
  auth: Object,
  match: Object,
};
type State = {};

export class UserTimeTrackView extends Component<Props, State> {
  state = {};

  render() {
    const userId = this.props.match.params.userId;
    const timeTrackId = this.props.match.params.timeTrackId;
    return (
      <div>
        <TimeTrackBlock
          userId={userId}
          timeTrackId={timeTrackId}
          proxy={true}
          editLocation={`/users/${userId}/time-tracks/${timeTrackId}/edit`}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(UserTimeTrackView);
