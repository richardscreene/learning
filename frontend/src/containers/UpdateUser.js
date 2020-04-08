import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import UpdateUser from "../components/UpdateUser";
import { userUpdateRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  const userId = ownProps.location.state.userId;
  // look for user either in user list or the account
  return {
    user: [...state.users, state.account].find(user => {
      return user.userId === userId;
    }),
    isAccountAdmin: state.account.role === "admin"
  };
};

const mapDispatchToProps = {
  userUpdateRequested
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(UpdateUser)
);
