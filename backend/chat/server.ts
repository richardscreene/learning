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

//const MY_ROOM="my-room";
io.on("connection", socket => {
  console.log("a user connected", socket.id);
  //socket.join(MY_ROOM);

  socket.on("disconnect", socket => {
    console.log("a user disconnected");
  });

  socket.on("message", message => {
    console.log("a user messaged", socket.id, message.type || "NA");
    if (message.type === "connect") {
      //TODO - maybe use WeakMap to ensure no memory leak
      if (connected) {
        socket.emit("message", { type: "connected", user: sockets.get(connected) });
        connected.emit("message", { type: "connected", user: sockets.get(socket) });
        connected = null;
      } else {
        console.log("Wait for another user");
        connected = socket;
      }
    }
  });
});

const PORT: number = 3001;

server.listen(PORT, () => {
  console.log("Listening on port=", PORT);
});
