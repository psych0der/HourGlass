// @flow
import React from 'react';

import { PaginatedTimeTracks } from '../../components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTimeTrackList } from '../../redux/reducers/listTimeTracks';
import './index.css';
type Props = {
  auth: Object,
  listTimeTracks: Object,
  fetchTimeTrackList: () => *,
  history: Object,
  location: Object,
  match: Object,
};
type State = {};

export class MyTimeTracks extends React.Component<Props, State> {
  render() {
    const userId = this.props.auth.user.id;
    const userName = this.props.auth.user.name;
    const preferredWorkingHoursPerDay = this.props.auth.user
      .preferredWorkingHourPerDay;
    return (
      <PaginatedTimeTracks
        location={this.props.location}
        history={this.props.history}
        match={this.props.match}
        userId={userId}
        userName={userName}
        preferredWorkingHoursPerDay={preferredWorkingHoursPerDay}
        creationLink="/new/time-track"
        listTimeTracks={this.props.listTimeTracks}
        fetchTimeTrackList={this.props.fetchTimeTrackList}
        proxy={false}
      />
    );
  }
}

const mapStateToProps = ({ listTimeTracks, auth }) => ({
  listTimeTracks,
  auth,
});

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchTimeTrackList,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyTimeTracks);
