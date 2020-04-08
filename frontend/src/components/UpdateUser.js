import React from "react";
import { Form, Button, Modal } from "react-bootstrap";
import Details from "./fields/Details";
import Role from "./fields/Role";
import history from "../history";
import PropTypes from "prop-types";

export default class UpdateUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      email: "",
      name: "",
      role: ""
    };
  }

  componentDidMount() {
    this.setState(this.props.user);
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.userUpdateRequested(this.state);
  }

  onCancel(e) {
    e.preventDefault();
    history.goBack();
  }

  onChildChange(field, value) {
    this.setState({
      [field]: value
    });
  }

  render() {
    return this.props.user ? (
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Details
          email={this.state.email}
          name={this.state.name}
          update={this.onChildChange.bind(this)}
        />
        {(this.props.isAccountAdmin || this.props.user.role === "admin") && (
          <Role
            role={this.props.user.role}
            update={this.onChildChange.bind(this)}
          />
        )}
        <Button variant="primary" type="submit">
          Update
        </Button>
        <Button variant="secondary" onClick={this.onCancel.bind(this)}>
          Cancel
        </Button>
      </Form>
    ) : (
      ""
    );
  }
}

UpdateUser.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
  }),
  isAccountAdmin: PropTypes.bool.isRequired
};
