// @flow
import React, { Component } from 'react';
import TimeTrackEditBlock from '../TimeTrackEditBlock';
import { connect } from 'react-redux';

// Wrapper around user block
type Props = {
  auth: Object,
  match: Object,
};
type State = {};

export class EditTimeTrack extends Component<Props, State> {
  state = {};

  render() {
    const timeTrackId = this.props.match.params.timeTrackId;
    return (
      <TimeTrackEditBlock
        userId={this.props.auth.user.id}
        postEditLocation={`/time-tracks/${timeTrackId}`}
        proxy={false}
        timeTrackId={timeTrackId}
      />
    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps)(EditTimeTrack);
