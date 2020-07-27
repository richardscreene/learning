export const chatConnectRequested = localStream => ({
  type: "CHAT_CONNECT_REQUESTED",
  localStream
});

export const chatConnectSucceeded = (participant, remoteStream) => ({
  type: "CHAT_CONNECT_SUCCEEDED",
  participant,
  remoteStream
});

export const chatDisconnectRequested = () => ({
  type: "CHAT_DISCONNECT_REQUESTED"
});

export const chatDisconnectSucceeded = () => ({
  type: "CHAT_DISCONNECT_SUCCEEDED"
});
