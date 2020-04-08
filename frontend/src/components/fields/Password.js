import React from "react";
import {
  Form,
  Button,
  ToggleButton,
  ButtonGroup,
  Modal
} from "react-bootstrap";

export default class Password extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      confirm: ""
    };
    this.confirmRef = React.createRef();
  }

  onPasswordChange(field, e) {
    //    e.preventDefault();

    const target = e.target;
    this.setState({ [field]: target.value }, () => {
      if (this.state.password !== this.state.confirm) {
        this.confirmRef.current.setCustomValidity("Passwords do not match");
      } else {
        this.confirmRef.current.setCustomValidity("");
        this.props.update("password", this.state.password);
      }
      this.confirmRef.current.reportValidity();

      target.reportValidity();
      target.focus();
    });
  }

  render() {
    return (
      <>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            onChange={this.onPasswordChange.bind(this, "password")}
            value={this.state.password}
            minLength="8"
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirm"
            ref={this.confirmRef}
            onChange={this.onPasswordChange.bind(this, "confirm")}
            value={this.state.confirm}
            minLength="8"
            required
          />
        </Form.Group>
      </>
    );
  }
}
