import { call, put, takeLatest } from "redux-saga/effects";
import "regenerator-runtime/runtime";
import history from "../history";
import * as actions from "../actions";
import * as api from "../api";
import * as connection from "./connection";

function* generateError(err) {
  let action;
  if (err.response) {
    if (err.response && err.response.status === 401) {
      console.warn("Refresh timer expired");
      localStorage.removeItem("refreshToken");
      yield put(actions.accountLogoutSucceeded());
      history.push("/login");
    } else {
      action = actions.errorRaised(err.response.status, err.response.data);
    }
  } else {
    action = actions.errorRaised(500, err.message, err.stack);
  }
  if (action) {
    yield put(action);
  }
}

function* refresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  const credentials = yield call(api.refresh, refreshToken);
  connection.set(credentials.accessToken);
  yield put(actions.accountLoginUpdated(connection.account()));
}

function* sendWithRefresh(apiFunc, ...args) {
  try {
    return yield call(apiFunc, connection.get(), ...args);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log("access token expired");
      yield refresh();
      return yield call(apiFunc, connection.get(), ...args);
    } else {
      throw err;
    }
  }
}

function* list(action) {
  try {
    const users = yield sendWithRefresh(api.list, action.skip, action.limit);
    yield put(actions.userListSucceeded(users));
  } catch (err) {
    yield generateError(err);
  }
}

function* create(action) {
  try {
    const user = yield sendWithRefresh(api.create, action.user);
    yield put(actions.userResponseSucceeded(user));
    history.goBack();
  } catch (err) {
    yield generateError(err);
  }
}

function* retrieve(action) {
  try {
    const user = yield sendWithRefresh(api.retrieve, action.userId);
    yield put(actions.userResponseSucceeded(user));
  } catch (err) {
    yield generateError(err);
  }
}

function* patch(action) {
  try {
    const user = yield sendWithRefresh(api.patch, action.userId, action.mod);
    yield put(actions.userResponseSucceeded(user));
    const account = connection.account();
    if (account && user.userId === account.userId) {
      yield refresh();
    }
  } catch (err) {
    yield generateError(err);
  }
}

function* update(action) {
  try {
    const user = yield sendWithRefresh(api.update, action.user);
    yield put(actions.userResponseSucceeded(user));
    const account = connection.account();
    if (account && user.userId === account.userId) {
      yield refresh();
    }
    history.goBack();
  } catch (err) {
    yield generateError(err);
  }
}

function* del(action) {
  try {
    yield sendWithRefresh(api.del, action.userId);
    yield put(actions.userDeleteSucceeded(action.userId));
  } catch (err) {
    yield generateError(err);
  }
}

export const sagas = [
  takeLatest("USER_LIST_REQUESTED", list),
  takeLatest("USER_CREATE_REQUESTED", create),
  takeLatest("USER_RETRIEVE_REQUESTED", retrieve),
  takeLatest("USER_PATCH_REQUESTED", patch),
  takeLatest("USER_UPDATE_REQUESTED", update),
  takeLatest("USER_DELETE_REQUESTED", del)
];
