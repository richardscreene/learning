export const accountInitialiseRequested = () => ({
  type: "ACCOUNT_INITIALISE_REQUESTED"
});

export const accountLoginRequested = (email, password) => ({
  type: "ACCOUNT_LOGIN_REQUESTED",
  email,
  password
});

export const accountLoginUpdated = (account) => ({
  type: "ACCOUNT_LOGIN_UPDATE",
  account
});

export const accountPasswordRequested = (password) => ({
  type: "ACCOUNT_PASSWORD_REQUESTED",
  password
});

export const accountRegisterRequested = (account) => ({
  type: "ACCOUNT_REGISTER_REQUESTED",
  account
});

export const accountForgotRequested = (email) => ({
  type: "ACCOUNT_FORGOT_REQUESTED",
  email
});

export const accountResetRequested = (token, password) => ({
  type: "ACCOUNT_RESET_REQUESTED",
  token,
  password
});

export const accountLogoutRequested = () => ({
  type: "ACCOUNT_LOGOUT_REQUESTED"
});

export const accountLogoutSucceeded = () => ({
  type: "ACCOUNT_LOGOUT_SUCCEEDED"
});
