import { connect } from "react-redux";
import Login from "../components/Login";
import { accountLoginRequested } from "../actions";

const mapDispatchToProps = {
  accountLoginRequested
};

export default connect(null, mapDispatchToProps)(Login);
