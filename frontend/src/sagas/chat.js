import { call, put, takeLatest } from "redux-saga/effects";
import "regenerator-runtime/runtime";
import history from "../history";
import * as actions from "../actions";
import * as http from "../services/http";
import * as ws from "../services/ws";
import * as connection from "./connection";

//TODO - this is shared with users.js
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
  const credentials = yield call(http.refresh, refreshToken);
  connection.set(credentials.accessToken);
  yield put(actions.accountLoginUpdated(connection.account()));
}

function* sendWithRefresh(wsFunc, ...args) {
  try {
    return yield call(wsFunc, connection.get(), ...args);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log("access token expired");
      yield refresh();
      return yield call(wsFunc, connection.get(), ...args);
    } else {
      throw err;
    }
  }
}

function* connect(action) {
  console.log("connect saga");
  try {
    yield sendWithRefresh(ws.connect, message => {
      put(actions.chatMessageReceived());
    });
  } catch (err) {
    yield generateError(err);
  }
}

function* disconnect(action) {
  try {
    yield sendWithRefresh(ws.disconnect);
    yield put(actions.chatDisconnectSucceeded());
  } catch (err) {
    yield generateError(err);
  }
}

function* message(action) {
  try {
    yield sendWithRefresh(ws.message, action.message);
  } catch (err) {
    yield generateError(err);
  }
}

export const sagas = [
  takeLatest("CHAT_CONNECT_REQUESTED", connect),
  takeLatest("CHAT_DISCONNECT_REQUESTED", disconnect),
  takeLatest("CHAT_MESSAGE_REQUESTED", message)
];
