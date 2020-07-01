import React from "react";
import { Route, Switch, Link } from "react-router-dom";

import signin from "../pages/signin";
import reset from "../pages/reset";
import home from "../pages/home";
import users from "../pages/users";
import create from "../pages/create";
import update from "../pages/update";
import password from "../pages/password";
import chat from "../pages/chat";
import screen2 from "../pages/screen2";
import Header from "../containers/Header";
import Error from "../containers/Error";

export default class App extends React.Component {
  componentDidMount() {
    // if there is a refresh token in local storage then logon
    this.props.accountInitialiseRequested();
  }

  render() {
    if (this.props.authed) {
      return (
        <>
          <Error />
          <Header />
          <Switch>
            <Route exact path="/" component={home} />
            <Route exact path="/users" component={users} />
            <Route exact path="/create" component={create} />
            <Route exact path="/update" component={update} />
            <Route exact path="/password" component={password} />
            <Route exact path="/chat" component={chat} />
            <Route exact path="/screen2" component={screen2} />
            <Route path="/reset/:resetToken" component={reset} />
          </Switch>
        </>
      );
    } else {
      return (
        <>
          <Error />
          <Header />
          <Switch>
            <Route path="/reset/:resetToken" component={reset} />
            <Route component={signin} />
          </Switch>
        </>
      );
    }
  }
}
