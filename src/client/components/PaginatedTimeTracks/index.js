// @flow
import React from 'react';
import {
  Button,
  PageHeader,
  Pager,
  FormGroup,
  FormControl,
} from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import queryString from 'qs';
import { LinkContainer } from 'react-router-bootstrap';
import { IN_PROGRESS, SUCCESS } from '../../commons/constants';
import { LoaderButton, TimeTrackRow } from '../../components';
// import { fetchTimeTrackList } from '../../redux/reducers/listTimeTracks';
import './index.css';
type Props = {
  userName: ?string,
  preferredWorkingHoursPerDay: ?number,
  listTimeTracks: object,
  userId: string,
  proxy: boolean,
  fetchTimeTrackList: () => *,
  sortBy: string,
  sortOrder: -1 | 1,
  query: string,
  page: number,
  history: Object,
  location: Object,
  match: object,
  creationLink: Object,
  userInfo: ?Object,
  fetchUserInformation: ?() => *,
};
type State = {};

export class PaginatedTimeTracks extends React.Component<Props, State> {
  static defaultProps = {
    sortBy: 'date',
    sortOrder: -1,
    page: 1,
    query: '',
    userName: null,
    preferredWorkingHoursPerDay: null,
    proxy: false,
    userInfo: null,
    fetchUserInformation: null,
  };

  /* Re trigger request */
  fetchAgain = () => {
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    this.props.fetchTimeTrackList({
      userId: this.props.userId,
      page: queryStrings.page || this.props.page,
      sortBy: queryStrings.sortBy || this.props.sortBy,
      sortOrder: queryStrings.sortOrder || this.props.sortOrder,
      query: queryStrings.query || this.props.query,
    });
  };
  /* trigger request to fetch user list */
  componentDidMount() {
    this.fetchAgain();
    /* If we didn't get userName then load user's info in redux and use it from there */
    if (!this.props.userName) {
      this.props.fetchUserInformation(this.props.userId);
    }
  }

  setPage = (page: number) => {
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    const searchQuery = queryStrings.query || this.props.query;
    const path = this.props.match.path;
    this.props.history.push(`${path}?page=${page}&query=${searchQuery}`);
  };

  /**
   * handles key press events on search bar
   */
  handleSearchKeyPress = (event: Event) => {
    if (event.key === 'Enter') {
      const queryStrings = queryString.parse(this.props.location.search, {
        ignoreQueryPrefix: true,
      });
      const pageNumber = parseInt(queryStrings.page || this.props.page, 10);
      const query = event.target.value;
      const path = this.props.location.pathname;
      this.props.history.push(`${path}?page=${pageNumber}&query=${query}`);
    }
  };

  render() {
    let component = null;
    const visitLinkPrefix = this.props.proxy
      ? `/users/${this.props.userId}/time-tracks`
      : `/time-tracks`;
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    const pageNumber = parseInt(queryStrings.page || this.props.page, 10);
    const userName = this.props.userName
      ? this.props.userName
      : this.props.userInfo.status === SUCCESS
        ? this.props.userInfo.userInfo.name
        : null;
    const userPreferredWorkingHoursPerDay = this.props
      .preferredWorkingHoursPerDay
      ? this.props.preferredWorkingHoursPerDay
      : this.props.userInfo.status === SUCCESS
        ? this.props.userInfo.userInfo.preferredWorkingHourPerDay
        : null;
    const searchQuery = queryStrings.query || this.props.query;
    if (this.props.listTimeTracks.status === IN_PROGRESS) {
      component = (
        <LoaderButton
          block
          bsSize="large"
          disabled={true}
          type="submit"
          isLoading={true}
          text="Loading Time track"
          loadingText="Loading Time tracks"
        />
      );
    } else if (this.props.listTimeTracks.status === SUCCESS) {
      component = (
        <div>
          <PageHeader>
            <span>Time tracks for {userName}</span>
            <LinkContainer to={this.props.creationLink}>
              <Button bsStyle="warning" className="pull-right">
                Create new time track
              </Button>
            </LinkContainer>
          </PageHeader>
          <div>
            <div className="pageCount">Page-{pageNumber}</div>
            <div style={{ display: 'inline-block' }} className="pull-right">
              <FormGroup>
                <FormControl
                  type="text"
                  placeholder="Search"
                  defaultValue={searchQuery}
                  onKeyPress={this.handleSearchKeyPress}
                />
              </FormGroup>
            </div>
          </div>

          <div className="timeTrackList">
            <div className="timeTrackColumns">
              <div className="t-col">Date</div>
              <div className="t-col">Duration</div>
              <div className="t-col">Note</div>
            </div>
            {this.props.listTimeTracks.timeTrackList.map(timeTrack => {
              return (
                <NavLink to={`${visitLinkPrefix}/${timeTrack.id}`}>
                  <TimeTrackRow
                    timeTrackData={timeTrack}
                    key={timeTrack.id}
                    preferredWorkingHoursPerDay={
                      userPreferredWorkingHoursPerDay
                    }
                  />
                </NavLink>
              );
            })}
          </div>
          <div className="paginationBlock">
            <Pager>
              <Pager.Item
                href="#"
                disabled={!this.props.listTimeTracks.hasPrev}
                onClick={() => this.setPage(pageNumber - 1)}
              >
                Previous
              </Pager.Item>{' '}
              <Pager.Item
                href="#"
                disabled={!this.props.listTimeTracks.hasNext}
                onClick={() => this.setPage(pageNumber + 1)}
              >
                Next
              </Pager.Item>
            </Pager>
            <div style={{ textAlign: 'center' }}>
              {!this.props.proxy && (
                <LinkContainer to="/time-track-report">
                  <Button bsStyle="success">Generate report</Button>
                </LinkContainer>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      /* show error notification */
      component = (
        <div className="ErrorMessage">
          <div>Unable to fetch user information</div>
          <div>{this.props.listTimeTracks.error}</div>
          <div style={{ width: 100, margin: '0 auto', marginTop: '10px' }}>
            <LoaderButton
              block
              bsSize="small"
              disabled={false}
              type="button"
              isLoading={false}
              text="Retry"
              loadingText=""
              onClick={this.fetchAgain}
            />
          </div>
        </div>
      );
    }
    return <div className="TimeTrackListContainer">{component}</div>;
  }
}

export default PaginatedTimeTracks;
