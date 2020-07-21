import { connect } from "react-redux";
import Chat from "../components/Chat";
import { chatConnectRequested, chatMessageRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  return {
    //authed: state.account && state.account.role === "admin",
    //users: state.users
  };
};

const mapDispatchToProps = {
  chatConnectRequested,
  chatMessageRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
