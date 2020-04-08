import React from "react";
import { Form, Button } from "react-bootstrap";
import Password from "./fields/Password";
import PropTypes from "prop-types";

export default class Reset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: ""
    };
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.accountResetRequested(
      this.props.resetToken,
      this.state.password
    );
  }

  onChildChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Password update={this.onChildChange.bind(this)} />
        <Button variant="primary" type="submit">
          Reset
        </Button>
      </Form>
    );
  }
}

Reset.propTypes = {
  resetToken: PropTypes.string.isRequired
};
