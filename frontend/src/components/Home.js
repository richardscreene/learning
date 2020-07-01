import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <>
        <Link
          to={{
            pathname: "/users"
          }}
        >
          <FontAwesomeIcon icon={faUser} title="Go to users pages" />
        </Link>
      </>
    );
  }
}
