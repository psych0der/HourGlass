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
import { LoaderButton, UserRow } from '../../components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUserList } from '../../redux/reducers/listUsers';
import './index.css';
type Props = {
  listUsers: object,
  fetchUserList: () => *,
  sortBy: string,
  sortOrder: -1 | 1,
  query: string,
  page: number,
  history: Object,
  location: Object,
};
type State = {};

export class Users extends React.Component<Props, State> {
  static defaultProps = {
    sortBy: 'createdAt',
    sortOrder: -1,
    page: 1,
    query: '',
  };

  /* Re trigger request */
  fetchAgain = () => {
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    this.props.fetchUserList({
      page: queryStrings.page || this.props.page,
      sortBy: queryStrings.sortBy || this.props.sortBy,
      sortOrder: queryStrings.sortOrder || this.props.sortOrder,
      query: queryStrings.query || this.props.query,
    });
  };
  /* trigger request to fetch user list */
  componentDidMount() {
    this.fetchAgain();
  }

  setPage = (page: number) => {
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    const searchQuery = queryStrings.query || this.props.query;
    this.setState({ page }, () =>
      this.props.history.push(`/users?page=${page}&query=${searchQuery}`)
    );
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
      this.props.history.push(`/users?page=${pageNumber}&query=${query}`);
    }
  };

  render() {
    let component = null;
    const queryStrings = queryString.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    const pageNumber = parseInt(queryStrings.page || this.props.page, 10);
    const searchQuery = queryStrings.query || this.props.query;
    if (this.props.listUsers.status === IN_PROGRESS) {
      component = (
        <LoaderButton
          block
          bsSize="large"
          disabled={true}
          type="submit"
          isLoading={true}
          text="Loading users"
          loadingText="Loading users"
        />
      );
    } else if (this.props.listUsers.status === SUCCESS) {
      component = (
        <div>
          <PageHeader>
            <span>Users</span>
            <LinkContainer to="/new/user/">
              <Button bsStyle="warning" className="pull-right">
                Create new User
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

          <div className="userList">
            <div className="userListColumns">
              <div className="t-col">Name</div>
              <div className="t-col" style={{ paddingLeft: '75px' }}>
                Role
              </div>
            </div>
            {this.props.listUsers.userList.map(user => {
              return (
                <NavLink to={`/users/${user.id}`}>
                  <UserRow userData={user} key={user.id} />
                </NavLink>
              );
            })}
          </div>
          <div className="paginationBlock">
            <Pager>
              <Pager.Item
                href="#"
                disabled={!this.props.listUsers.hasPrev}
                onClick={() => this.setPage(pageNumber - 1)}
              >
                Previous
              </Pager.Item>{' '}
              <Pager.Item
                href="#"
                disabled={!this.props.listUsers.hasNext}
                onClick={() => this.setPage(pageNumber + 1)}
              >
                Next
              </Pager.Item>
            </Pager>
          </div>
        </div>
      );
    } else {
      /* show error notification */
      component = (
        <div className="ErrorMessage">
          <div>Unable to fetch user information</div>
          <div>{this.props.listUsers.error}</div>
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
    return <div className="UserListContainer">{component}</div>;
  }
}

const mapStateToProps = ({ listUsers }) => ({ listUsers });

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchUserList,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Users);
