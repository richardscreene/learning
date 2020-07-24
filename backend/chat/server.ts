import * as express from "express";
import * as socketio from "socket.io";
import { Application, Request, Response, NextFunction } from "express";
const app: Application = express();
import { User, Role } from "../user/types";
import * as Boom from "@hapi/boom";

import * as authenticate from "../user/authenticate";
const AUTH_REGEX: RegExp = /^Bearer\s+(.+)/;

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

let sockets = new WeakMap();
let connected = null;

io.use((socket, next) => {
  return Promise.resolve()
    .then(() => {
      const bearerToken = socket.handshake.headers["authorization"];
      console.log("bearerToken=", bearerToken);
      if (!bearerToken) {
        return Promise.reject(
          Boom.unauthorized("Badly formed authorization header")
        );
      } else {
        //TODO - can we share the regex in authenticate
        let parts = bearerToken.match(AUTH_REGEX);
        if (!parts) {
          return Promise.reject(
            Boom.unauthorized("Badly formed authorization header")
          );
        } else {
          return Promise.resolve(parts[1]);
        }
      }
    })
    .then(token => {
      return authenticate.verify(token);
    })
    .then((user: User) => {
      sockets.set(socket, user);
      console.log("user=", user);
      next();
    })
    .catch(err => {
      console.log("err=", err);
      //next(err);
      next();
    });
});

const MY_ROOM="my-room";
io.on("connection", socket => {
  console.log("a user connected", socket.id);
  socket.join(MY_ROOM);

  //TODO - maybe use WeakMap to ensure no memory leak
  if (connected) {
    console.log("Connecting", socket.id, connected.id);
    // TODO generate a unique ID across multiple instances, cannot use userId
    // since the same user might appear multiple times (esp. during testing)
    socket.emit("message", {
      type: "connected",
      id: connected.id,
      user: sockets.get(connected)
    });
    connected.emit("message", {
      type: "connected",
      id: socket.id,
      user: sockets.get(socket)
    });
  } else {
    console.log("Wait for another user");
    connected = socket;
  }

  socket.on("disconnect", socket => {
    console.log("a user disconnected");
    connected = null;
  });

  socket.on("message", message => {
    console.log("a user messaged", socket.id, message.type || "NA");
    //TODO - don't use rooms - sio might be distributed
    socket.to(MY_ROOM).emit("message", message);
  });
});

const PORT: number = 3001;

server.listen(PORT, () => {
  console.log("Listening on port=", PORT);
});
