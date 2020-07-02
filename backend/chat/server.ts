import * as express from "express";
import * as socketio from "socket.io";
import { Application, Request, Response, NextFunction } from "express";
const app: Application = express();
import { User, Role } from "../user/types";
import * as Boom from "@hapi/boom";

import * as authenticate from "../user/authenticate";

const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  //TODO - there must be better way to handle CORS
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin":
        process.env.CORS_ORIGIN || req.headers.origin,
      "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);
    res.end();
  }
});

io.use((socket, next) => {
  const token = socket.handshake.headers["authorization"];
  console.log("token=", token);
  authenticate
    .verify(token)
    .then((user: User) => {
      console.log("user=", user);
      next();
    })
    .catch(err => {
      console.log("err=", err);
      //next(err);
      next();
    });
});

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

server.listen(PORT, () => {
  console.log("Listening on port=", PORT);
});
