import { all } from "redux-saga/effects";
import { sagas as accountSagas } from "./account";
import { sagas as usersSagas } from "./users";
import { sagas as chatSagas } from "./chat";

export default function* rootSaga() {
  yield all([...accountSagas, ...usersSagas, ...chatSagas]);
}
