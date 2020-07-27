const INITIAL_STATE = {};

const chat = (state = INITIAL_STATE, action) => {
  console.debug("chat reducer", state, action);
  switch (action.type) {
    case "CHAT_CONNECT_SUCCEEDED":
      return {
        participant: action.participant,
        remoteStream: action.remoteStream
      };
    case "CHAT_DISCONNECT_SUCCEEDED":
      return {};
    default:
      return state;
  }
};

export default chat;
