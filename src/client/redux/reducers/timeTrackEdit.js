// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';
import { push } from 'react-router-redux';
import pickBy from 'lodash.pickby';
import identity from 'lodash.identity';

export const TIME_TRACK_EDIT_IN_PROGRESS =
  'HOURGLASS/TIME_TRACK_EDIT_IN_PROGRESS';
export const RESET_TIME_TRACK_EDIT_STATE =
  'HOURGLASS/RESET_TIME_TRACK_EDIT_STATE';
export const RESET_TIME_TRACK_DELETE_STATE =
  'HOURGLASS/RESET_TIME_TRACK_DELETE_STATE';
export const TIME_TRACK_EDIT_SUCCESS = 'HOURGLASS/TIME_TRACK_EDIT_SUCCESS';
export const TIME_TRACK_EDIT_FAILED = 'HOURGLASS/TIME_TRACK_EDIT_FAILED';

export const TIME_TRACK_DELETE_IN_PROGRESS =
  'HOURGLASS/TIME_TRACK_DELETE_IN_PROGRESS';
export const TIME_TRACK_DELETE_SUCCESS = 'HOURGLASS/TIME_TRACK_DELETE_SUCCESS';
export const TIME_TRACK_DELETE_FAILED = 'HOURGLASS/TIME_TRACK_DELETE_FAILED';

const initialState = {
  status: IDLE,
  error: null,
  deleteStatus: IDLE,
  deleteError: null,
};
type State = {
  status: string,
  error: object | null,
  deleteStatus: string,
  deleteError: object | null,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case TIME_TRACK_EDIT_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
      };

    case TIME_TRACK_EDIT_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
      };

    case TIME_TRACK_EDIT_FAILED:
      return {
        ...state,
        status: FAILED,
        error: action.error.toString(),
      };

    case TIME_TRACK_DELETE_IN_PROGRESS:
      return {
        ...state,
        deleteStatus: IN_PROGRESS,
        deleteError: null,
      };

    case TIME_TRACK_DELETE_SUCCESS:
      return {
        ...state,
        deleteStatus: SUCCESS,
        deleteError: null,
      };

    case TIME_TRACK_DELETE_FAILED:
      return {
        ...state,
        deleteStatus: FAILED,
        deleteError: action.error.toString(),
      };
    case RESET_TIME_TRACK_DELETE_STATE:
      return {
        ...state,
        deleteStatus: IDLE,
        deleteError: null,
      };
    case RESET_TIME_TRACK_EDIT_STATE:
      return initialState;
    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_TIME_TRACK_EDIT_STATE,
  };
};

/**
 * edit user info
 * @param {string} note
 * @param {numner} duration
 * @param {string} date
 * @param {string} userId
 * @param {string} timeTrackid
 * @param {string} targetLocation
 */
export const editTimeTrack = ({
  userId,
  timeTrackId,
  note,
  duration,
  date,
  targetLocation,
}: {
  userId: string,
  timeTrackId: string,
  note: ?string,
  duration: number,
  date: string,
  targetLocation: string,
}) => (dispatch: Dispatch) => {
  const sanitized_data = pickBy({ note, duration, date }, identity);
  return dispatch({
    types: [
      TIME_TRACK_EDIT_IN_PROGRESS,
      TIME_TRACK_EDIT_SUCCESS,
      TIME_TRACK_EDIT_FAILED,
    ],
    promise: () =>
      axios({
        method: 'PATCH',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}/timeTracks/${timeTrackId}/`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
        data: sanitized_data,
      })
        .then(() => {
          dispatch(push(targetLocation + '?edit=successful'));
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};

export const deleteTimeTrack = (
  userId: string,
  timeTrackId: string,
  targetLocation: string
) => (dispatch: Dispatch) => {
  return dispatch({
    types: [
      TIME_TRACK_DELETE_IN_PROGRESS,
      TIME_TRACK_DELETE_SUCCESS,
      TIME_TRACK_DELETE_FAILED,
    ],
    promise: () =>
      axios({
        method: 'DELETE',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}/timeTracks/${timeTrackId}`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
      })
        .then(() => {
          dispatch(push(targetLocation));
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
