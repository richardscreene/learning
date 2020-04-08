const INITIAL_STATE = [];

const users = (state = INITIAL_STATE, action) => {
  console.debug("users reducer", state, action);
  switch (action.type) {
    case "USER_CREATE_SUCCEEDED":
      // add new user to start of list (but preserve the size)
      return [action.user, ...state].slice(0, -1);
    case "USER_DELETE_SUCCEEDED":
      return state.filter(user => user.userId !== action.userId);
    case "USER_RESPONSE_SUCCEEDED":
      return state.map(user => {
        return user.userId === action.user.userId ? action.user : user;
      });
    case "USER_LIST_SUCCEEDED":
      // existing data is deleted when we request a new page
      return action.users;
    default:
      return state;
  }
};

export default users;
