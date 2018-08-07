/* Sample reducer */
export const ACTION_A = 'SAMPLE/ACTION-A';
export const ACTION_B = 'SAMPLE/ACTION-B';

const initialState = {
  x: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ACTION_A:
      return {
        ...state,
        x: 2,
      };

    case ACTION_B:
      return {
        ...state,
        x: 3,
      };

    default:
      return state;
  }
};
