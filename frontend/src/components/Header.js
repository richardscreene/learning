import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { logoutRequested } from "../actions";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  onLogout(e) {
    e.preventDefault();
    this.props.accountLogoutRequested();
  }

  render() {
    return (
      <Navbar>
        <Navbar.Brand>Redux Learning</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/home">
              Home
            </Nav.Link>
            {this.props.account && this.props.account.role === "admin" && (
              <Nav.Link as={Link} to="/users">
                Users
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/screen1">
              Screen1
            </Nav.Link>
            <Nav.Link as={Link} to="/screen2">
              Screen2
            </Nav.Link>
          </Nav>
          {this.props.account ? (
            <Nav>
              <NavDropdown
                title={this.props.account.name}
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item
                  as={Link}
                  to={{
                    pathname: "/update",
                    state: {
                      userId: this.props.account.userId
                    }
                  }}
                >
                  Edit details
                </NavDropdown.Item>
                <NavDropdown.Item
                  as={Link}
                  to={{
                    pathname: "/password"
                  }}
                >
                  Change password
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link onClick={this.onLogout.bind(this)}>
                <FontAwesomeIcon icon={faSignOutAlt} title="Logout" />
              </Nav.Link>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login">
                <FontAwesomeIcon icon={faSignInAlt} title="Login" />
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

Header.propTypes = {
  account: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
  })
};
