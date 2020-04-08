
export const userCreateRequested = (user) => ({
  type: "USER_CREATE_REQUESTED",
  user
});

export const userResponseSucceeded = (user) => ({
  type: "USER_RESPONSE_SUCCEEDED",
  user
});

export const userRetrieveRequested = (userId) => ({
  type: "USER_RETRIEVE_REQUESTED",
  userId
});

export const userPatchRequested = (userId, mod) => ({
  type: "USER_PATCH_REQUESTED",
  userId,
  mod
});

export const userUpdateRequested = (user) => ({
  type: "USER_UPDATE_REQUESTED",
  user
});

export const userListRequested = (skip, limit) => ({
  type: "USER_LIST_REQUESTED",
  skip,
  limit
});

export const userListSucceeded = (users) => ({
  type: "USER_LIST_SUCCEEDED",
  users
});

export const userDeleteRequested = (userId) => ({
  type: "USER_DELETE_REQUESTED",
  userId
});

export const userDeleteSucceeded = (userId) => ({
  type: "USER_DELETE_SUCCEEDED",
  userId
});
