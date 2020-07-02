import * as express from "express";
import * as socketio from "socket.io";
import { Application, Request, Response, NextFunction } from "express";
const app: Application = express();
import * as cors from "cors";
import { User, Role } from "../user/types";
import * as Boom from "@hapi/boom";

import * as authenticate from "../user/authenticate";

const http = require("http").Server(app);
//var server = require("http").Server(app);
const io = require("socket.io").listen(http);
//NB. socketio-auth is no longer supported
require("socketio-auth")(io, {
  authenticate: (socket, data, cb) => {
    console.log("authenticating...", data);

    authenticate
      .verify(data.token)
      .then((user: User) => {
        console.log("user=", user);
        cb(null, true);
      })
      .catch(err => {
        console.log("err=", err);
        //TODO ignoring auth for now....
        //TODO cb(err);
        cb(null, true);
      });
  }
});

//app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(cors({ origin: "http://localhost:8080", credentials: true }));

io.on("connection", socket => {
  console.log("a user connected");

  socket.on("disconnect", socket => {
    console.log("a user disconnected");
  });

  socket.on("message", message => {
    console.log("a user messaged", message);
  });
});

const PORT: number = 3001;

http.listen(PORT, () => {
  console.log("Listening on port=", PORT);
});
