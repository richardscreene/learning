import React from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import Login from "../containers/Login";
import Register from "../containers/Register";
import Forgot from "../containers/Forgot";

export default function signin() {
  return (
    <div>
      <h1>Sign-in Page</h1>
      <Tabs defaultActiveKey="login">
        <Tab eventKey="login" title="Login">
          <Login />
        </Tab>
        <Tab eventKey="register" title="Register">
          <Register />
        </Tab>
        <Tab eventKey="forgot" title="Forgot">
          <Forgot />
        </Tab>
      </Tabs>
    </div>
  );
}
