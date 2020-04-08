const INITIAL_STATE = null;

const account = (state = INITIAL_STATE, action) => {
  console.debug("account reducer", state, action);
  switch (action.type) {
    case "ACCOUNT_LOGIN_UPDATE":
    case "ACCOUNT_LOGIN_SUCCEEDED":
      return action.account;
    case "ACCOUNT_LOGOUT_SUCCEEDED":
      return null;
    default:
      return state;
  }
};

export default account;
