import React from "react";
import { Button, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import history from "../history";

export default class Error extends React.Component {
  constructor(props) {
    super(props);
  }

  onCancel(e) {
    e.preventDefault();
    this.props.errorCleared();
    history.goBack();
  }

  render() {
    if (this.props.error) {
      return (
        <Modal show={true} onHide={this.onCancel.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            An error occurred. Status code is {this.props.error.status} - the
            message is {this.props.error.message}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.onCancel.bind(this)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      );
    } else {
      return "";
    }
  }
}

Error.propTypes = {
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
    stack: PropTypes.string
  })
};
