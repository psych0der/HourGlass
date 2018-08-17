// @flow
import React, { Component } from 'react';
import TimeTrackEditBlock from '../TimeTrackEditBlock';
import { USER_MANGER, SUPER_ADMIN } from '../../commons/constants';

// Wrapper around user block
type Props = {
  match: Object,
};
type State = {};

export class EditUserTimeTrack extends Component<Props, State> {
  state = {};

  render() {
    const timeTrackId = this.props.match.params.timeTrackId;
    const userId = this.props.match.params.userId;
    return (
      <TimeTrackEditBlock
        userId={userId}
        postEditLocation={`/users/${userId}/time-tracks/${timeTrackId}`}
        proxy={true}
        timeTrackId={timeTrackId}
      />
    );
  }
}

export default EditUserTimeTrack;
