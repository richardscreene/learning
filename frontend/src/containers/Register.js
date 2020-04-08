import { connect } from "react-redux";
import Register from "../components/Register";
import { accountRegisterRequested } from "../actions";

const mapDispatchToProps = {
  accountRegisterRequested
};

export default connect(null, mapDispatchToProps)(Register);
