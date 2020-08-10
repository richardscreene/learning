import axios from "axios";
import combineUrls from "axios/lib/helpers/combineURLs";
import { raiseError, loginUpdate, logoutSucceeded } from "../actions";

const BASE_URL = process.env.USER_API_URL;
const USERS_URL = combineUrls(BASE_URL, "/users");

const URL = {
  LOGIN: combineUrls(BASE_URL, "login"),
  REFRESH: combineUrls(BASE_URL, "refresh"),
  REGISTER: combineUrls(BASE_URL, "register"),
  FORGOT: combineUrls(BASE_URL, "forgot"),
  RESET: combineUrls(BASE_URL, "reset"),
  LOGOUT: combineUrls(BASE_URL, "logout"),
  PASSWORD: combineUrls(BASE_URL, "password")
};

export function login(email, password) {
  console.debug("API login", email, password);
  const obj = { email, password };
  return axios.put(URL.LOGIN, obj).then(res => {
    return Promise.resolve(res.data);
  });
}

export function refresh(refreshToken) {
  console.debug("API refresh");
  return axios
    .put(URL.REFRESH, null, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    })
    .then(res => {
      return Promise.resolve(res.data);
    });
}

export function password(refreshToken, password) {
  console.debug("API password", password);
  return axios
    .put(
      URL.PASSWORD,
      { password },
      {
        headers: { Authorization: `Bearer ${refreshToken}` }
      }
    )
    .then(res => {
      return Promise.resolve(res.data);
    });
}

export function register(user) {
  console.debug("API register", user);
  return axios.post(URL.REGISTER, user).then(res => {
    return Promise.resolve(res.data);
  });
}

export function forgot(email) {
  console.debug("API forgot", email);
  return axios.put(URL.FORGOT, { email }).then(res => {
    return Promise.resolve(res.data);
  });
}

export function reset(resetToken, password) {
  console.debug("API reset", password);

  const url = combineUrls(URL.RESET, resetToken);

  return axios.put(url, { password }).then(res => {
    return Promise.resolve(res.data);
  });
}

export function logout(refreshToken) {
  console.debug("API logout");

  return axios
    .post(URL.LOGOUT, null, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    })
    .then(res => {
      return Promise.resolve(res.data);
    });
}
