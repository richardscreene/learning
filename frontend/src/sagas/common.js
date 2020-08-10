import { call, put } from "redux-saga/effects";
import * as actions from "../actions";
import * as connection from "./connection";
import * as rest from "../services/rest";

export function* generateError(err) {
  let action;
  if (err.response) {
    if (err.response && err.response.status === 401) {
      console.warn("Refresh timer expired");
      localStorage.removeItem("refreshToken");
      yield put(actions.accountLogoutSucceeded());
      history.push("/login");
    } else {
      action = actions.errorRaised(err.response.status, err.response.data.errors[0].message);
    }
  } else {
    action = actions.errorRaised(500, err.message, err.stack);
  }
  if (action) {
    yield put(action);
  }
}

export function* refresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  const credentials = yield call(rest.refresh, refreshToken);
  connection.set(credentials.accessToken);
  yield put(actions.accountLoginUpdated(connection.account()));
}

export function* sendWithRefresh(func, ...args) {
  try {
    return yield call(func, connection.get(), ...args);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log("access token expired");
      yield refresh();
      return yield call(func, connection.get(), ...args);
    } else {
      throw err;
    }
  }
}
