import React from "react";
import {
  Form,
  Button,
  ToggleButton,
  ButtonGroup,
  Modal
} from "react-bootstrap";
import Details from "./fields/Details";
import Role from "./fields/Role";
import Password from "./fields/Password";
import history from "../history";

export default class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      name: "",
      role: "user",
      password: ""
    };
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.userCreateRequested(this.state);
  }

  onChildChange(field, value) {
    this.setState({ [field]: value });
  }

  onCancel(e) {
    e.preventDefault();
    history.goBack();
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Details update={this.onChildChange.bind(this)} />
        <Role role={this.state.role} update={this.onChildChange.bind(this)} />
        <Password update={this.onChildChange.bind(this)} />

        <Button variant="primary" type="submit">
          Create
        </Button>
        <Button variant="secondary" onClick={this.onCancel.bind(this)}>
          Cancel
        </Button>
      </Form>
    );
  }
}
