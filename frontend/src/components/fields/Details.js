import React from "react";
import {
  Form,
  Button,
  ToggleButton,
  ButtonGroup,
  Modal
} from "react-bootstrap";

export default class Details extends React.Component {
  constructor(props) {
    super(props);
  }

  onChange(field, e) {
    const target = e.target;
    target.reportValidity();
    this.props.update(field, target.value);
  }

  render() {
    return (
      <>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="john.smith@example.com"
            onChange={this.onChange.bind(this, "email")}
            defaultValue={this.props.email}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="string"
            name="name"
            placeholder="John Smith"
            onChange={this.onChange.bind(this, "name")}
            defaultValue={this.props.name}
            required
          />
        </Form.Group>
      </>
    );
  }
}
