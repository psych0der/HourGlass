// @flow
import React from 'react';
import { PaginatedTimeTracks } from '../../components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTimeTrackList } from '../../redux/reducers/listTimeTracks';
import { fetchUserInformation } from '../../redux/reducers/userInfo';
import './index.css';
type Props = {
  auth: Object,
  listTimeTracks: Object,
  fetchTimeTrackList: () => *,
  history: Object,
  location: Object,
  match: Object,
  userInfo: Object,
  fetchUserInformation: () => *,
};
type State = {};

export class UserTimeTracks extends React.Component<Props, State> {
  render() {
    const userId = this.props.match.params.userId;
    return (
      <PaginatedTimeTracks
        location={this.props.location}
        history={this.props.history}
        match={this.props.match}
        userId={userId}
        userName={null}
        preferredWorkingHoursPerDay={null}
        creationLink={`/users/${userId}/new/time-track`}
        listTimeTracks={this.props.listTimeTracks}
        fetchTimeTrackList={this.props.fetchTimeTrackList}
        proxy={true}
        userInfo={this.props.userInfo}
        fetchUserInformation={this.props.fetchUserInformation}
      />
    );
  }
}

const mapStateToProps = ({ listTimeTracks, auth, userInfo }) => ({
  listTimeTracks,
  auth,
  userInfo,
});

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchTimeTrackList,
      fetchUserInformation,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserTimeTracks);
