import { store } from "../store";
import { put, takeLatest } from "redux-saga/effects";
import "regenerator-runtime/runtime";
import history from "../history";
import * as actions from "../actions";
import * as ws from "../services/ws";
import * as common from "./common";

let localStream;
let pc;
let participant;
let mode;

const MODE = {
  NONE: "NONE",
  CALLER: "CALLER",
  CALLEE: "CALLEE"
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};
const answerOptions = {};
const pcOptions = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};

function pcClose() {
  if (pc) {
    pc.close();
    pc = null;
  }
  // destroy the websocket if it still exists
  ws.disconnect();
  participant = null;
  mode = MODE.NONE;
}

function receive(message) {
  console.log("message=", message);

  switch (message.type) {
    case "caller":
      console.log("We're the caller");
      mode = MODE.CALLER;
      participant = message.user;

      pc = new RTCPeerConnection(pcOptions);
      pc.onicecandidate = onIceCandidate;
      pc.oniceconnectionstatechange = onIceConnectionState;

      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.ontrack = onAddTrack;

      return pc
        .createOffer(offerOptions)
        .then(desc => {
          console.log("offer=", desc);
          return pc.setLocalDescription(desc).then(() => {
            return Promise.resolve(desc);
          });
        })
        .then(desc => {
          console.log("Set local descroption");
          ws.send(desc);
        })
        .catch(err => {
          console.log("caller err=", err);
        });
      break;
    case "callee":
      participant = message.user;
      mode = MODE.CALLEE;

      console.log("We're the callee - wait for offer");
      break;
    case "offer":
      if (pc) {
        console.warn("Already connected");
        return;
      }
      pc = new RTCPeerConnection(pcOptions);
      pc.onicecandidate = onIceCandidate;
      pc.oniceconnectionstatechange = onIceConnectionState;

      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.ontrack = onAddTrack;

      pc.setRemoteDescription(message)
        .then(() => {
          console.log("A");
          return pc.createAnswer(answerOptions);
        })
        .then(desc => {
          console.log("B");
          return pc.setLocalDescription(desc).then(() => {
            return Promise.resolve(desc);
          });
        })
        .then(desc => {
          console.log("C");
          ws.send(desc);
        })
        .catch(err => {
          console.log("offer err=", err);
        });
      break;
    case "answer":
      console.log("GOT AN ANSWER");
      if (!pc) {
        console.warn("No offer sent");
        return;
      }

      pc.setRemoteDescription(message)
        .then(() => {
          console.log("Set remote descriptioN");
        })
        .catch(err => {
          console.warn("Failed ot set remote", err);
        });
      break;
    default:
      if (typeof message.candidate === "string") {
        if (!pc) {
          console.warn("No offer/answer sent");
          return;
        }
        console.log("Candidate", message);
        pc.addIceCandidate(message);
      } else {
        console.warn("Unknown message");
      }
  }
}

function onIceConnectionState(event) {
  console.log("onIceConnectionState event=", event);
  if (pc.iceConnectionState === "disconnected") {
    pcClose();
    store.dispatch(actions.chatDisconnectSucceeded());
  }
}

function onIceCandidate(event) {
  console.log("event=", event);
  if (event && event.candidate) {
    ws.send(event.candidate).catch(err => {
      console.warn("Cannot send ICE candidate - err=", err);
    });
    if (mode === MODE.CALLEE) {
      console.log("disconnect the websocket");
      ws.disconnect();
    }
  }
}

function onAddTrack(event) {
  console.log("GOT REMOTE STREAM", event);
  if (event.streams[0]) {
    console.log("Send chatConnectSucceeded");
    if (mode === MODE.CALLER) {
      console.log("disconnect the websocket");
      ws.disconnect();
    }
    store.dispatch(actions.chatConnectSucceeded(participant, event.streams[0]));
  }
}

function* connect(action) {
  console.log("connect saga");
  try {
    if (pc) {
      // if we've already connected then terminate the current session
      // and start a new one
      pcClose();
      yield put(actions.chatDisconnectSucceeded());
    }

    localStream = action.localStream;

    yield common.sendWithRefresh(ws.connect, receive);
  } catch (err) {
    console.warn("err=", err);
    yield common.generateError(err);
  }
}

function* disconnect(action) {
  try {
    pcClose();
    yield put(actions.chatDisconnectSucceeded());
  } catch (err) {
    yield common.generateError(err);
  }
}

export const sagas = [
  takeLatest("CHAT_CONNECT_REQUESTED", connect),
  takeLatest("CHAT_DISCONNECT_REQUESTED", disconnect)
];
