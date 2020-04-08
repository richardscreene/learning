import React from "react";
import {
  Form,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Modal
} from "react-bootstrap";

export default class Details extends React.Component {
  constructor(props) {
    super(props);
  }

  onChange(field, e) {
    e.target.reportValidity();
    this.props.update(field, e.target.value);
  }

  render() {
    return (
      <Form.Group>
        <Form.Label>Role</Form.Label>
        <ToggleButtonGroup name="role" defaultValue={this.props.role}>
          <ToggleButton
            type="radio"
            name="role"
            onChange={this.onChange.bind(this, "role")}
            checked={this.props.role === "user"}
            value="user"
          >
            User
          </ToggleButton>
          <ToggleButton
            type="radio"
            name="role"
            onChange={this.onChange.bind(this, "role")}
            checked={this.props.role === "admin"}
            value="admin"
          >
            Admin
          </ToggleButton>
        </ToggleButtonGroup>
      </Form.Group>
    );
  }
}
