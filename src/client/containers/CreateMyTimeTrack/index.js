// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createTimeTrack } from '../../redux/reducers/createTimeTrack';
import { TimeTrackCreator } from '../../components';
import './index.css';

type Props = {
  timeTrackCreationState: Object,
  auth: Object,
  createTimeTrack: () => *,
};
type State = {};

export class CreateMyTimeTrack extends Component<Props, State> {
  render() {
    return (
      <TimeTrackCreator
        isAdmin={false}
        userId={this.props.auth.user.id}
        createTimeTrack={this.props.createTimeTrack}
        redirectAbsolute={false}
        timeTrackCreationState={this.props.timeTrackCreationState}
        submitString="Create TimeTrack"
        loadingString="Creating...."
      />
    );
  }
}

const mapStateToProps = ({ createTimeTrack, auth }) => ({
  timeTrackCreationState: createTimeTrack,
  auth,
});

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      createTimeTrack,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateMyTimeTrack);
