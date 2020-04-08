import React from "react";
import { Form, Button, Modal } from "react-bootstrap";
import history from "../history";

export default class Forgot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      infoShow: false
    };
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.accountForgotRequested(this.state.email);
    this.setState({ infoShow: true });
  }

  onCancel(e) {
    this.setState({ infoShow: false });
    history.goBack();
  }

  onChange(field, e) {
    this.setState({ [field]: e.target.value });
    e.target.reportValidity();
  }

  render() {
    return (
      <>
        <Modal show={this.state.infoShow} onHide={this.onCancel.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Done</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            If you have a valid account then you receive an email explaining how
            to reset your password.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.onCancel.bind(this)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

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
          <Button variant="primary" type="submit">
            Forgot
          </Button>
        </Form>
      </>
    );
  }
}
