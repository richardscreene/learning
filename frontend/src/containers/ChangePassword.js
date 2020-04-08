import { connect } from "react-redux";
import ChangePassword from "../components/ChangePassword";
import { accountPasswordRequested } from "../actions";

const mapDispatchToProps = {
  accountPasswordRequested
};

export default connect(null, mapDispatchToProps)(ChangePassword);
