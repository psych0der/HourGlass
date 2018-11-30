// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';
import { push } from 'react-router-redux';
import pickBy from 'lodash.pickby';
import identity from 'lodash.identity';

export const CREATE_TIME_TRACK_IN_PROGRESS =
  'HOURGLASS/CREATE_TIME_TRACK_IN_PROGRESS';
export const RESET_CREATE_TIME_TRACK_STATE =
  'HOURGLASS/RESET_CREATE_TIME_TRACK_STATE';
export const CREATE_TIME_TRACK_SUCCESS = 'HOURGLASS/CREATE_TIME_TRACK_SUCCESS';
export const CREATE_TIME_TRACK_FAILED = 'HOURGLASS/CREATE_TIME_TRACK_FAILED';

const initialState = {
  status: IDLE,
  error: null,
};
type State = {
  status: string,
  error: object | null,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case CREATE_TIME_TRACK_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
      };

    case CREATE_TIME_TRACK_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
      };

    case CREATE_TIME_TRACK_FAILED:
      return {
        ...state,
        status: FAILED,
        error: action.error.toString(),
      };

    case RESET_CREATE_TIME_TRACK_STATE:
      return initialState;

    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_CREATE_TIME_TRACK_STATE,
  };
};

/**
 * Register user to system
 * @param {string} userID
 * @param {string} note
 * @param {string} date
 * @param {number} duration
 * @param {boolean} redirectAbsolute
 */
export const createTimeTrack = ({
  userId,
  note,
  date,
  duration,
  redirectAbsolute = false,
}: {
  userId: string,
  note: ?string,
  duration: number,
  date: string,
  redirectAbsolute: boolean,
}) => (dispatch: Dispatch) => {
  const sanitized_data = pickBy({ note, duration, date }, identity);
  dispatch({
    types: [
      CREATE_TIME_TRACK_IN_PROGRESS,
      CREATE_TIME_TRACK_SUCCESS,
      CREATE_TIME_TRACK_FAILED,
    ],
    promise: () =>
      axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}/timeTracks`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
        data: sanitized_data,
      })
        .then(() => {
          dispatch(
            push(
              redirectAbsolute
                ? `/users/${userId}/time-tracks/?creation=success`
                : `/time-tracks/?creation=success`
            )
          );
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
