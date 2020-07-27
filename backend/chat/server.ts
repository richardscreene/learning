import * as express from "express";
import * as socketio from "socket.io";
import { Application, Request, Response, NextFunction } from "express";
const app: Application = express();
import { User, Role } from "../user/types";
import * as Boom from "@hapi/boom";

import * as authenticate from "../user/authenticate";

//LATER - we want to be able to horizontally scale ths service.
// simple solution would be to limit connections to within the same service,
// ie. a connection from service A would have to wait for another connection
// to service A.
// Alternatively, we could use socket.io redis clusters which will do all
// of the hard work.
// NB. the websocket is only connected while the peers exchange signalling
// information.  This should make it easy to deploy as a lambda function.

const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
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

let users = new WeakMap();
let peers = new WeakMap();
let waiting = null;

io.use((socket, next) => {
  return Promise.resolve()
    .then(() => {
      const authHeader = socket.handshake.headers["authorization"];
      return authenticate.parseAuthorization(authHeader);
    })
    .then(token => {
      return authenticate.verify(token);
    })
    .then((user: User) => {
      users.set(socket, user);
      console.log("user=", user);
      next();
    })
    .catch(err => {
      console.log("err=", err);
      next(err);
    });
});

// we don't use rooms 'cos the users are likely to be spread
// across multiple instances

io.on("connection", socket => {
  console.log("a user connected", socket.id);

  if (waiting) {
    console.log("Connecting", socket.id, waiting.id);
    socket.emit("message", {
      type: "caller",
      user: users.get(waiting)
    });
    waiting.emit("message", {
      type: "callee",
      user: users.get(socket)
    });
    peers.set(socket, waiting);
    peers.set(waiting, socket);
  } else {
    console.log("Wait for another user");
    waiting = socket;
  }

  socket.on("disconnect", socket => {
    console.log("a user disconnected");
    if (waiting.id === socket.id) {
      // if the waiting socket disconnected then delete it.
      // the weakmap will ensure everything else is cleared.
      waiting = null;
    }
  });

  socket.on("message", message => {
    console.log("a user messaged", socket.id, message.type || "NA");
    const peer = peers.get(socket);
    if (peer) {
      peer.emit("message", message);
    } else {
      console.warn("No peer for socketId=", socket.id);
    }
  });
});

const PORT: number = 3001;

server.listen(PORT, () => {
  console.log("Listening on port=", PORT);
});
