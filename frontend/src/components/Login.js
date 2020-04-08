import React from "react";
import { Form, Button } from "react-bootstrap";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    };
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.accountLoginRequested(this.state.email, this.state.password);
  }

  onChange(field, e) {
    //    e.preventDefault();
    this.setState({ [field]: e.target.value });
    e.target.reportValidity();
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="john.smith@example.com"
            onChange={this.onChange.bind(this, "email")}
            value={this.state.email}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            onChange={this.onChange.bind(this, "password")}
            value={this.state.password}
            minLength="8"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    );
  }
}
