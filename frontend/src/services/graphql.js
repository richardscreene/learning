import axios from "axios";
import combineUrls from "axios/lib/helpers/combineURLs";
import { raiseError, loginUpdate, logoutSucceeded } from "../actions";

const BASE_URL = process.env.USER_API_URL;
const GRAPHQL_URL = combineUrls(BASE_URL, "/graphql");

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

  return axios({
    method: "POST",
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      query: "mutation($userId: ID!) { delete(userId: $userId) }",
      variables: {
        userId
      }
    }
  }).then(res => {
    return Promise.resolve(res.data);
  });
}
