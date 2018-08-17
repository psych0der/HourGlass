// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createTimeTrack } from '../../redux/reducers/createTimeTrack';
import { TimeTrackCreator } from '../../components';
import './index.css';

type Props = {
  timeTrackCreationState: Object,
  createTimeTrack: () => *,
  match: Object,
};
type State = {};

export class CreateUserTimeTrack extends Component<Props, State> {
  render() {
    const userId = this.props.match.params.userId;
    return (
      <TimeTrackCreator
        isAdmin={true}
        userId={userId}
        createTimeTrack={this.props.createTimeTrack}
        redirectAbsolute={true}
        timeTrackCreationState={this.props.timeTrackCreationState}
        submitString="Create TimeTrack"
        loadingString="Creating...."
      />
    );
  }
}

const mapStateToProps = ({ createTimeTrack }) => ({
  timeTrackCreationState: createTimeTrack,
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
)(CreateUserTimeTrack);
