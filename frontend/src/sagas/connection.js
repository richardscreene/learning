import { call, put } from "redux-saga/effects";
import * as actions from "../actions";

let accessToken;
let accountObj = {};

function deriveUserFromToken(token) {
  if (!token) {
    return null;
  }
  try {
    let obj = JSON.parse(atob(token.split(".")[1]));
    delete obj.iat;
    delete obj.exp;
    return obj;
  } catch (err) {
    console.warn("Failed to parse token - err=", err);
    return null;
  }
}

export function set(myAccessToken) {
  accessToken = myAccessToken;
  accountObj = deriveUserFromToken(accessToken);
}

export function get() {
  return accessToken;
}

export function account() {
  return accountObj;
}
