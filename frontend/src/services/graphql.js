import axios from "axios";
import combineUrls from "axios/lib/helpers/combineURLs";
import { raiseError, loginUpdate, logoutSucceeded } from "../actions";

const BASE_URL = process.env.USER_API_URL;
const USERS_URL = combineUrls(BASE_URL, "/users");
const GRAPHQL_URL = combineUrls(BASE_URL, "/graphql");

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
    method: "POST",
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      query:
        "query($skip: Int, $limit: Int) { list(skip: $skip, limit: $limit) { userId, email, name, role } }",
      variables: {
        skip,
        limit
      }
    }
  }).then(res => {
    return Promise.resolve(
      // array expected
      Object.keys(res.data.data.list).map(k => res.data.data.list[k])
    );
  });
}

export function create(accessToken, user) {
  console.debug("API create", user);
  return axios({
    method: "POST",
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      query:
        "mutation($createUser: CreateUser) { create(createUser: $createUser) { userId, email, name, role } }",
      variables: {
        createUser: user
      }
    }
  }).then(res => {
    return Promise.resolve(res.data.data.create);
  });
}

export function retrieve(accessToken, userId) {
  console.debug("API retrieve", userId);

  return axios({
    method: "POST",
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      query:
        "query($userId: ID) { retrieve(userId: $userId) { userId, email, name, role } }",
      variables: {
        userId
      }
    }
  }).then(res => {
    return Promise.resolve(res.data.data.retrieve);
  });
}

export function patch(accessToken, userId, user) {
  console.debug("API patch", userId, user);

  return axios({
    method: "POST",
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      query:
        "mutation($userId: ID!, $patchUser: PatchUser) { patch(userId: $userId, patchUser: $patchUser) { userId, email, name, role } }",
      variables: {
        userId,
        patchUser: Object.assign({}, user, { userId: undefined })
      }
    }
  }).then(res => {
    return Promise.resolve(res.data.data.patch);
  });
}

export function update(accessToken, user) {
  console.debug("API update", user);
  return axios({
    method: "POST",
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      query:
        "mutation($userId: ID!, $updateUser: UpdateUser) { update(userId: $userId, updateUser: $updateUser) { userId, email, name, role } }",
      variables: {
        userId: user.userId,
        updateUser: Object.assign({}, user, { userId: undefined })
      }
    }
  }).then(res => {
    console.log("res.data=", res.data);
    return Promise.resolve(res.data.data.update);
  });
}

export function del(accessToken, userId) {
  console.debug("API del", userId);

  const url = combineUrls(USERS_URL, userId);
  return axios({
    method: "POST",
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      query:
        "mutation($userId: ID!) { delete(userId: $userId) { } }",
      variables: {
        userId
      }
    }
  }).then(res => {
    return Promise.resolve(res.data);
  });
}
