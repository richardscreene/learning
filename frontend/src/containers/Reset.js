import { connect } from "react-redux";
import Reset from "../components/Reset";
import { accountResetRequested } from "../actions";
import { withRouter } from "react-router-dom";

const mapStateToProps = (state, ownProps) => {
  return {
    resetToken:
      ownProps.match &&
      ownProps.match.params &&
      ownProps.match.params.resetToken
        ? ownProps.match.params.resetToken.replace(/:/g, ".")
        : ""
  };
};

const mapDispatchToProps = {
  accountResetRequested
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Reset));
