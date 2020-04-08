import { all } from "redux-saga/effects";
import { sagas as accountSagas } from "./account";
import { sagas as usersSagas } from "./users";

export default function* rootSaga() {
  yield all([...accountSagas, ...usersSagas]);
}
