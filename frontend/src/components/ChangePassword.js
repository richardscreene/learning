import React from "react";
import { Form, Button, Modal } from "react-bootstrap";
import Password from "./fields/Password";
import history from "../history";

export default class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: ""
    };
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.accountPasswordRequested(this.state.password);
  }

  onCancel(e) {
    e.preventDefault();
    history.goBack();
  }

  onChildChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Password update={this.onChildChange.bind(this)} />
        <Button variant="primary" type="submit">
          Update
        </Button>
        <Button variant="secondary" onClick={this.onCancel.bind(this)}>
          Cancel
        </Button>
      </Form>
    );
  }
}
