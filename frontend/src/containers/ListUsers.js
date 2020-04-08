import { connect } from "react-redux";
import ListUsers from "../components/ListUsers";
import { userListRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  return {
    authed: state.account && state.account.role === "admin",
    users: state.users
  };
};

const mapDispatchToProps = {
  userListRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(ListUsers);
