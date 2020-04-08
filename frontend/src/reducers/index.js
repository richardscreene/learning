import { combineReducers } from "redux";
import error from "./error";
import account from "./account";
import users from "./users";

export default combineReducers({
  error,
  account,
  users
});
