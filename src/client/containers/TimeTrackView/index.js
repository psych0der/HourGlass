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

export class TimeTrackView extends Component<Props, State> {
  state = {};

  render() {
    const timeTrackId = this.props.match.params.timeTrackId;
    const userId = this.props.auth.user.id;

    return (
      <div>
        <TimeTrackBlock
          userId={userId}
          timeTrackId={timeTrackId}
          proxy={false}
          editLocation={`/time-tracks/${timeTrackId}/edit`}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(TimeTrackView);
