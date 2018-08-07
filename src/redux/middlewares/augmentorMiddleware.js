/**
 * This function generates a middleware that augments redux abilities, and allows action dispatchers to dispatch
 * promises and functions instead of plain objects.
 *
 * For this to work on promises,  action object should contain:
 *  - types array containing `3` keys for TRIGGER, SUCCESS, and FAILED states
 *  - `promise` attribute containing generator function
 * When promise is triggered, TRIGGER state is triggered. Similarly, on success, SUCCESS is triggered
 * and on failure, FAILED state is triggered. SUCCESS and FAILED are called with success and error content
 * respectively
 */

export default function augmentorMiddleware() {
  return ({ dispatch, getState }) => {
    return next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
      if (!promise) {
        return next(action);
      }

      const [REQUEST, SUCCESS, FAILURE] = types;
      next({ ...rest, type: REQUEST });

      const actionPromise = promise();
      actionPromise
        .then(
          result => next({ ...rest, result, type: SUCCESS }),
          error => next({ ...rest, error, type: FAILURE })
        )
        .catch(error => {
          console.error('MIDDLEWARE ERROR:', error);
          next({ ...rest, error, type: FAILURE });
        });

      return actionPromise;
    };
  };
}
