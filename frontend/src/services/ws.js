import socketio from "socket.io-client";
import { raiseError, messageUpdate } from "../actions";

console.log("env=", process.env);
const BASE_URL = process.env.CHAT_API_URL;
let sio;

export function connect(accessToken, cb) {
  console.debug("connect");

  console.log("token=", accessToken);
  if (sio) {
    // already connected
    return Promise.resolve();
  } else {
    console.log("connecting...");
    return new Promise((resolve, reject) => {
      sio = socketio(BASE_URL, {
        transportOptions: {
          polling: {
            extraHeaders: {
              authorization: `Bearer ${accessToken}`
            }
          }
        }
      });

      sio.on("connect", () => {
        console.log("connected");
        sio.on("message", message => {
          console.log("Got message=", message);
          cb(message);
        });

        sio.on("disconnect", () => {
          console.log("disconnected");
          sio = null;
        });
        resolve();
      });

      sio.on("error", err => {
        console.warn("Error on websocket - err=", err);
        //sio.close();
        //sio = null;
      });
    });
  }
}

//TODO - should we re-connect on token timeout???
//TODO - should we connect when we send first message?  then we don't need to pass WsConnect around
export function send(message) {
  console.log("Send message=", message);
  if (!sio) {
    return Promise.resolve(); //TODO - should be error
  } else {
    sio.emit("message", message);
    return Promise.resolve();
  }
}

export function disconnect() {
  if (sio) {
    sio.close();
  }
  sio = null;
  return Promise.resolve();
}