// @flow
/* Add helpers here */
import { logout } from '../../redux/reducers/auth';

/* Network error handler for axios. Handles logout on jwt expiry */
export const getNetworkErrorHandler = (dispatch: Dispatch) => (
  error: object | Error
) => {
  if (error.response) {
    /* check for jwt expiry */
    if (error.response.status == 401) {
      if (
        error.response.data &&
        error.response.data.message &&
        error.response.data.message == 'jwt expired'
      ) {
        /* trigger logout */
        dispatch(logout());
      }
    }

    if (error.response.data['errors'] !== undefined) {
      throw new Error(JSON.stringify(error.response.data['errors']));
    } else if (error.response.data['message'] !== undefined) {
      throw new Error(error.response.data.message);
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error(error.request);
    throw new Error(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error', error.message);
    throw new Error(error.message);
  }
};
