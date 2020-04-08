import { connect } from "react-redux";
import Forgot from "../components/Forgot";
import { accountForgotRequested } from "../actions";

const mapDispatchToProps = {
  accountForgotRequested
};

export default connect(null, mapDispatchToProps)(Forgot);
