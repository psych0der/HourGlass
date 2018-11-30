// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';

export const LIST_USERS_IN_PROGRESS = 'HOURGLASS/LIST_USERS_IN_PROGRESS';
export const RESET_LIST_USERS_STATE = 'HOURGLASS/RESET_LIST_USERS_STATE';
export const LIST_USERS_SUCCESS = 'HOURGLASS/LIST_USERS_SUCCESS';
export const LIST_USERS_FAILED = 'HOURGLASS/LIST_USERS_FAILED';

const initialState = {
  status: IDLE,
  error: null,
  userList: [],
  hasNext: false,
  hasPrev: false,
  page: 1,
  sortBy: 'createdAt',
  sortOrder: -1,
};
type State = {
  status: string,
  error: object | null,
  userList: Array<Object> | null,
  hasNext: boolean,
  hasPrev: boolean,
  page: number,
  sortBy: string,
  sortOrder: 1 | -1,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case LIST_USERS_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
        userInfo: null,
      };

    case LIST_USERS_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
        userList: action.result.users,
        hasNext: action.result.hasNext,
        hasPrev: action.result.hasPrev,
        page: action.result.page,
        sortBy: action.result.sortBy,
        sortOrder: action.result.sortOrder,
      };

    case LIST_USERS_FAILED:
      return {
        ...initialState,
        status: FAILED,
        error: action.error.toString(),
        userInfo: null,
      };
    case RESET_LIST_USERS_STATE:
      return initialState;
    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_LIST_USERS_STATE,
  };
};

/**
 * Fetch list of users
 * @param {number} page
 * @param {string} sortBy
 * @param {number} sortOrder
 * @param {string} search query
 */
export const fetchUserList = ({
  page,
  sortBy,
  sortOrder,
  query = '',
}: {
  page: number,
  sortBy: string,
  sortOrder: number,
  query: ?string,
}) => (dispatch: Dispatch) => {
  dispatch({
    types: [LIST_USERS_IN_PROGRESS, LIST_USERS_SUCCESS, LIST_USERS_FAILED],
    promise: () =>
      axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/search`,
        params: { page, sortBy, sortOrder, perPage: 5, query },
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
      })
        .then(res => {
          return Object.assign(
            {},
            { ...res.data },
            { page, sortBy, sortOrder }
          );
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
