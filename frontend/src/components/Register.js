import React from "react";
import { Form, Button } from "react-bootstrap";
import Password from "./fields/Password";
import Details from "./fields/Details";

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      name: "",
      role: "user", // should never be updated
      password: ""
    };
  }

  onSubmit(e) {
    e.preventDefault();
    e.preventDefault();
    this.props.accountRegisterRequested(this.state);
  }

  onChildChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Details update={this.onChildChange.bind(this)} />
        <Password update={this.onChildChange.bind(this)} />
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    );
  }
}
