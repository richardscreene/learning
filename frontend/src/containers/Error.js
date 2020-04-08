import { connect } from "react-redux";
import Error from "../components/Error";
import { errorCleared } from "../actions";

const mapStateToProps = (state, ownProps) => {
  return {
    error: state.error
  };
};

const mapDispatchToProps = {
  errorCleared
};

export default connect(mapStateToProps, mapDispatchToProps)(Error);
