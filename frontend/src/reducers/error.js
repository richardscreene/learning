const INITIAL_STATE = null;

const error = (state = INITIAL_STATE, action) => {
  console.debug("error reducer", state, action);
  switch (action.type) {
    case "ERROR_RAISED":
      return {
        status: action.status,
        message: action.message,
        stack: action.stack
      };
    case "ERROR_CLEARED":
      return null;
    default:
      return state;
  }
};

export default error;
