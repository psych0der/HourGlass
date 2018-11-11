// @flow
/* Add helpers here */
import { logout } from '../../redux/reducers/auth';
import isEqual from 'lodash.isequal';
import transform from 'lodash.transform';
import isObject from 'lodash.isobject';

// Network error handler for axios. Handles logout on jwt expiry
export const getNetworkErrorHandler = (dispatch: Dispatch) => (
  error: object | Error
) => {
  if (error.response) {
    /* check for jwt expiry */
    if (error.response.status === 401) {
      if (
        error.response.data &&
        error.response.data.message &&
        error.response.data.message === 'jwt expired'
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

// utility to return auth token for current request
export const getAuthToken = () => {
  if (localStorage.user) {
    const userObject = JSON.parse(localStorage.user);
    return 'Bearer ' + userObject.accessToken;
  } else {
    throw new Error('No auth information found. Login again to continue');
  }
};

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export const difference = (target: object, base: object) => {
  if (target !== base) {
    return true;
  }
  function changes(object, base) {
    return transform(object, function(result, value, key) {
      if (!isEqual(value, base[key])) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value;
      }
    });
  }
  return changes(target, base);
};
