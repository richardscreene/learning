import { call, put, takeLatest } from "redux-saga/effects";
import "regenerator-runtime/runtime";
import history from "../history";
import * as actions from "../actions";
import * as api from "../api";
import * as connection from "./connection";

function generateError(err) {
  let action;
  if (err.response) {
    action = actions.errorRaised(err.response.status, err.response.data);
  } else {
    action = actions.errorRaised(500, err.message, err.stack);
  }
  return action;
}

function* initialise() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      const credentials = yield call(api.refresh, refreshToken);
      connection.set(credentials.accessToken);
      yield put(actions.accountLoginUpdated(connection.account()));
    } catch (err) {
      // consume silently
    }
  }
}

function* login(action) {
  try {
    const credentials = yield call(api.login, action.email, action.password);
    localStorage.setItem("refreshToken", credentials.refreshToken);
    connection.set(credentials.accessToken);
    yield put(actions.accountLoginUpdated(connection.account()));
    history.push("/");
  } catch (err) {
    yield put(generateError(err));
  }
}

function* password(action) {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const credentials = yield call(api.password, refreshToken, action.password);
    localStorage.setItem("refreshToken", credentials.refreshToken);
    connection.set(credentials.accessToken);
    history.goBack();
  } catch (err) {
    yield put(generateError(err));
  }
}

function* register(action) {
  try {
    const credentials = yield call(api.register, action.account);
    localStorage.setItem("refreshToken", credentials.refreshToken);
    connection.set(credentials.accessToken);
    yield put(actions.accountLoginUpdated(connection.account()));
    history.push("/");
  } catch (err) {
    yield put(generateError(err));
  }
}

function* forgot(action) {
  try {
    yield call(api.forgot, action.email);
  } catch (err) {
    yield put(generateError(err));
  }
}

function* reset(action) {
  try {
    const credentials = yield call(api.reset, action.token, action.password);
    localStorage.setItem("refreshToken", credentials.refreshToken);
    connection.set(credentials.accessToken);
    yield put(actions.accountLoginUpdated(connection.account()));
    history.push("/");
  } catch (err) {
    yield put(generateError(err));
  }
}

function* logout(action) {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    yield call(api.logout, refreshToken);
  } catch (err) {
    // we do not generate an error if logout fails
  } finally {
    localStorage.removeItem("refreshToken");
    yield put(actions.accountLogoutSucceeded());
    history.push("/login");
  }
}

export const sagas = [
  takeLatest("ACCOUNT_INITIALISE_REQUESTED", initialise),
  takeLatest("ACCOUNT_LOGIN_REQUESTED", login),
  takeLatest("ACCOUNT_PASSWORD_REQUESTED", password),
  takeLatest("ACCOUNT_REGISTER_REQUESTED", register),
  takeLatest("ACCOUNT_FORGOT_REQUESTED", forgot),
  takeLatest("ACCOUNT_RESET_REQUESTED", reset),
  takeLatest("ACCOUNT_LOGOUT_REQUESTED", logout)
];
