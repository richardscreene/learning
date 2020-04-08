import { connect } from "react-redux";
import Header from "../components/Header";
import { accountLogoutRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account
  };
};

const mapDispatchToProps = {
  accountLogoutRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
