import { connect } from "react-redux";
import App from "../components/App";
import { accountInitialiseRequested } from "../actions";

const mapStateToProps = (state, ownProps) => {
  console.log("app container", state);
  return {
    authed: !!state.account
  };
};

const mapDispatchToProps = {
  accountInitialiseRequested
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
