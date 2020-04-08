import React from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faArrowUp,
  faArrowDown
} from "@fortawesome/free-solid-svg-icons";

export default class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteShow: false
    };
  }

  onPatch(obj, e) {
    e.preventDefault();
    this.props.userPatchRequested(this.props.user.userId, obj);
  }

  deleteModal(e) {
    e.preventDefault();
    this.setState({ deleteShow: true });
  }

  deleteCancelled(e) {
    this.setState({ deleteShow: false });
  }

  deleteConfirmed(e) {
    e.preventDefault();

    this.setState({ deleteShow: false });

    this.props.userDeleteRequested(this.props.user.userId);
  }

  render() {
    return (
      <>
        <Modal
          show={this.state.deleteShow}
          onHide={this.deleteCancelled.bind(this)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this user</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={this.deleteCancelled.bind(this)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={this.deleteConfirmed.bind(this)}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <tr>
          <td>{this.props.user.name}</td>
          <td>{this.props.user.email}</td>
          <td>
            {this.props.user.role}{" "}
            {this.props.user.role === "admin" && (
              <FontAwesomeIcon
                icon={faArrowDown}
                title="Downgrade to user"
                onClick={this.onPatch.bind(this, {
                  role: "user"
                })}
              />
            )}
            {this.props.user.role === "user" && (
              <FontAwesomeIcon
                icon={faArrowUp}
                title="Upgrade to admin"
                onClick={this.onPatch.bind(this, {
                  role: "admin"
                })}
              />
            )}
          </td>
          <td>
            {!this.props.isAccount && (
              <FontAwesomeIcon
                icon={faTrash}
                title="Delete this user"
                onClick={this.deleteModal.bind(this)}
              />
            )}
            <Link
              to={{
                pathname: "/update",
                state: {
                  userId: this.props.user.userId
                }
              }}
            >
              <FontAwesomeIcon icon={faEdit} title="Edit this user" />
            </Link>
          </td>
        </tr>
      </>
    );
  }
}

User.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
  }),
  isAccount: PropTypes.bool.isRequired
};
