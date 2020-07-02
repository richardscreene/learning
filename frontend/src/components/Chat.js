import React from "react";
import { Form } from "react-bootstrap";

//import { Link } from "react-router-dom";
//import { Button } from "react-bootstrap";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faUser } from "@fortawesome/free-solid-svg-icons";
import socketio from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:3001";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }

  componentDidMount() {
    console.log("Mounting the home page");
    //TODO - this should be moved to API so it can use the same token
    this.socketio = socketio(ENDPOINT);

    this.socketio.on("connect", () => {
      console.log("connected");
      this.socketio.emit("authentication", { token: "some shit" });
      this.socketio.on("authenticated", () => {
        console.log("Authenticated");
        // only handle messages once we authenticated
        this.socketio.on("message", (message) => {
          console.log("RX MSG=", message);
        });
      });
      this.socketio.on("unauthorized", err => {
        console.log("auth err=", err);
        //TODO - refresh access token and try again...
      });
    });
  }

  onSubmit(e) {
    const target = e.target;
    console.log("Message=", this.input.current.value);
    this.socketio.emit("message", this.input.current.value);
    e.preventDefault();
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Form.Group>
          <Form.Label>Message</Form.Label>
          <Form.Control
            type="string"
            name="message"
            placeholder="A message to be sent"
            defaultValue=""
            required
            ref={this.input}
          />
        </Form.Group>
      </Form>
    );
  }
}
