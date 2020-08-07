import { put, takeLatest } from "redux-saga/effects";
import "regenerator-runtime/runtime";
import history from "../history";
import * as actions from "../actions";
//import * as rest from "../services/rest";
  import * as rest from "../services/graphql";    //TODO - fix me....

import * as connection from "./connection";
import * as common from "./common";

function* list(action) {
  try {
    const users = yield common.sendWithRefresh(rest.list, action.skip, action.limit);
    yield put(actions.userListSucceeded(users));
  } catch (err) {
    yield common.generateError(err);
  }
}

function* create(action) {
  try {
    const user = yield common.sendWithRefresh(rest.create, action.user);
    console.log("user=", user);
    yield put(actions.userResponseSucceeded(user));
    history.goBack();
  } catch (err) {
    yield common.generateError(err);
  }
}

function* retrieve(action) {
  try {
    const user = yield common.sendWithRefresh(rest.retrieve, action.userId);
    yield put(actions.userResponseSucceeded(user));
  } catch (err) {
    yield common.generateError(err);
  }
}

function* patch(action) {
  try {
    const user = yield common.sendWithRefresh(rest.patch, action.userId, action.mod);
    yield put(actions.userResponseSucceeded(user));
    const account = connection.account();
    if (account && user.userId === account.userId) {
      yield common.refresh();
    }
  } catch (err) {
    yield common.generateError(err);
  }
}

function* update(action) {
  try {
    const user = yield common.sendWithRefresh(rest.update, action.user);
    yield put(actions.userResponseSucceeded(user));
    const account = connection.account();
    if (account && user.userId === account.userId) {
      yield common.refresh();
    }
    history.goBack();
  } catch (err) {
    yield common.generateError(err);
  }
}

function* del(action) {
  try {
    yield common.sendWithRefresh(rest.del, action.userId);
    yield put(actions.userDeleteSucceeded(action.userId));
  } catch (err) {
    yield common.generateError(err);
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
