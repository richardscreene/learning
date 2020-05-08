import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import UpdateUser from "../components/UpdateUser";
import { userUpdateRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  const userId = ownProps.location.state.userId;
  // look for user either in user list or the account
  let user = [...state.users, state.account].find(user => {
    return user.userId === userId;
  });
  return {
    user,
    // role is updateable if we're logged in as admin or the users
    // being edited is admin
    isRoleUpdateable: state.account.role === "admin" || user.role === "admin"
  };
};

const mapDispatchToProps = {
  userUpdateRequested
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(UpdateUser)
);
