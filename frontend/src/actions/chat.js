export const chatConnectRequested = () => ({
  type: "CHAT_CONNECT_REQUESTED"
});

export const chatDisconnectRequested = () => ({
  type: "CHAT_DISCONNECT_REQUESTED"
});

export const chatDisconnectSucceeded = () => ({
  type: "CHAT_DISCONNECT_SUCCEEDED"
});

export const chatMessageReceived = message => ({
  type: "CHAT_MESSAGE_RECEIVED",
  message
});

export const chatMessageRequested = message => ({
  type: "CHAT_MESSAGE_REQUESTED",
  message
});
