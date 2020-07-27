import React from "react";
import { Link } from "react-router-dom";
import User from "../containers/User";
import { Table, Pagination } from "react-bootstrap";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const USERS_PER_PAGE = 25;

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.skip = 0;
  }

  getUsers() {
    // add one so we know if we've got a next page
    this.props.userListRequested(this.skip, USERS_PER_PAGE + 1);
  }

  componentDidMount() {
    this.getUsers();
  }

  onPaginate(type) {
    switch (type) {
      case "first":
        this.skip = 0;
        break;
      case "previous":
        this.skip -= USERS_PER_PAGE;
        break;
      case "next":
        this.skip += USERS_PER_PAGE;
        break;
    }
    this.getUsers();
  }

  render() {
    return (
      this.props.authed && (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>
                  <Link to="/create">
                    <FontAwesomeIcon icon={faPlus} title="Add new user" />
                  </Link>
                </th>
              </tr>
            </thead>
            {this.props.users && (
              <tbody>
                {this.props.users.map(user => {
                  return <User key={user.userId} userId={user.userId} />;
                })}
              </tbody>
            )}
          </Table>
          <Pagination>
            <Pagination.First onClick={this.onPaginate.bind(this, "first")} />
            <Pagination.Prev
              disabled={this.skip === 0}
              onClick={this.onPaginate.bind(this, "previous")}
            />
            <Pagination.Ellipsis disabled={true} />
            <Pagination.Next
              disabled={
                this.props.users && this.props.users.length <= USERS_PER_PAGE
              }
              onClick={this.onPaginate.bind(this, "next")}
            />
          </Pagination>
        </>
      )
    );
  }
}

Users.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired
    })
  )
};
