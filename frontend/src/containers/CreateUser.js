import { connect } from "react-redux";
import CreateUser from "../components/CreateUser";
import { userCreateRequested } from "../actions";

const mapDispatchToProps = {
  userCreateRequested
};

export default connect(null, mapDispatchToProps)(CreateUser);
