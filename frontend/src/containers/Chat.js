import { connect } from "react-redux";
import Chat from "../components/Chat";
import { chatConnectRequested, chatDisconnectRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  console.log("MAPPING STATE", state, ownProps);
  return {
    participant: state.chat.participant,
    remoteStream: state.chat.remoteStream
  };
};

const mapDispatchToProps = {
  chatConnectRequested,
  chatDisconnectRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
