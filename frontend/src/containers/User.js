import { connect } from "react-redux";
import User from "../components/User";
import { userDeleteRequested, userPatchRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  const userId = ownProps.userId;
  return {
    user: state.users.find(user => {
      return user.userId === userId;
    }),
    isAccount: state.account.userId === userId
  };
};

const mapDispatchToProps = {
  userPatchRequested,
  userDeleteRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(User);
