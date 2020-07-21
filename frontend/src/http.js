import axios from "axios";
import combineUrls from "axios/lib/helpers/combineURLs";
import { raiseError, loginUpdate, logoutSucceeded } from "./actions";

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

export function list(accessToken, skip, limit) {
  console.debug("API list", skip, limit);
  return axios({
    method: "GET",
    url: USERS_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      skip,
      limit
    }
  }).then(res => {
    return Promise.resolve(res.data);
  });
}

export function create(accessToken, user) {
  console.debug("API create", user);
  return axios({
    method: "POST",
    url: USERS_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: user
  }).then(res => {
    return Promise.resolve(res.data);
  });
}

export function retrieve(accessToken, userId) {
  console.debug("API retrieve", userId);

  const url = combineUrls(USERS_URL, userId);
  return axios({
    method: "GET",
    url,
    headers: { Authorization: `Bearer ${accessToken}` }
  }).then(res => {
    return Promise.resolve(res.data);
  });
}

export function patch(accessToken, userId, obj) {
  console.debug("API patch", userId, obj);

  const url = combineUrls(USERS_URL, userId);
  return axios({
    method: "PATCH",
    url,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: obj
  }).then(res => {
    return Promise.resolve(res.data);
  });
}

export function update(accessToken, user) {
  console.debug("API update", user);

  const url = combineUrls(USERS_URL, user.userId);
  return axios({
    method: "PUT",
    url,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: Object.assign({}, user, { userId: undefined })
  }).then(res => {
    return Promise.resolve(res.data);
  });
}

export function del(accessToken, userId) {
  console.debug("API del", userId);

  const url = combineUrls(USERS_URL, userId);
  return axios({
    method: "DELETE",
    url,
    headers: { Authorization: `Bearer ${accessToken}` }
  }).then(res => {
    return Promise.resolve(res.data);
  });
}
