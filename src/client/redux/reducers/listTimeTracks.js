// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';

export const LIST_TIME_TRACKS_IN_PROGRESS =
  'HOURGLASS/LIST_TIME_TRACKS_IN_PROGRESS';
export const RESET_LIST_TIME_TRACKS_STATE =
  'HOURGLASS/RESET_LIST_TIME_TRACKS_STATE';
export const LIST_TIME_TRACKS_SUCCESS = 'HOURGLASS/LIST_TIME_TRACKS_SUCCESS';
export const LIST_TIME_TRACKS_FAILED = 'HOURGLASS/LIST_TIME_TRACKS_FAILED';

const initialState = {
  status: IDLE,
  error: null,
  timeTrackList: [],
  hasNext: false,
  hasPrev: false,
  page: 1,
  sortBy: 'createdAt',
  sortOrder: -1,
};
type State = {
  status: string,
  error: object | null,
  timeTrackList: Array<Object> | null,
  hasNext: boolean,
  hasPrev: boolean,
  page: number,
  sortBy: string,
  sortOrder: 1 | -1,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case LIST_TIME_TRACKS_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
      };

    case LIST_TIME_TRACKS_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
        timeTrackList: action.result.timeTracks,
        hasNext: action.result.hasNext,
        hasPrev: action.result.hasPrev,
        page: action.result.page,
        sortBy: action.result.sortBy,
        sortOrder: action.result.sortOrder,
      };

    case LIST_TIME_TRACKS_FAILED:
      return {
        ...initialState,
        status: FAILED,
        error: action.error.toString(),
        userInfo: null,
      };
    case RESET_LIST_TIME_TRACKS_STATE:
      return initialState;
    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_LIST_TIME_TRACKS_STATE,
  };
};

/**
 * Fetch list of users
 * @param {string} userId
 * @param {number} page
 * @param {string} sortBy
 * @param {number} sortOrder
 * @param {string} search query
 */
export const fetchTimeTrackList = ({
  userId,
  page,
  sortBy,
  sortOrder,
  query = '',
}: {
  userId: string,
  page: number,
  sortBy: string,
  sortOrder: number,
  query: ?string,
}) => (dispatch: Dispatch) => {
  dispatch({
    types: [
      LIST_TIME_TRACKS_IN_PROGRESS,
      LIST_TIME_TRACKS_SUCCESS,
      LIST_TIME_TRACKS_FAILED,
    ],
    promise: () =>
      axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}/timeTracks/search`,
        params: { page, sortBy: 'date', sortOrder, perPage: 5, query },
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
