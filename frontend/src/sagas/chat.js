import { store } from "../store";
import { call, put, takeLatest } from "redux-saga/effects";
import "regenerator-runtime/runtime";
import history from "../history";
import * as actions from "../actions";
import * as http from "../services/http";
import * as ws from "../services/ws";
import * as connection from "./connection";

let localStream;
let remoteStream;
let pc;
let socketId;
let participant;

//TODO - this is shared with users.js
function* generateError(err) {
  let action;
  if (err.response) {
    if (err.response && err.response.status === 401) {
      console.warn("Refresh timer expired");
      localStorage.removeItem("refreshToken");
      yield put(actions.accountLogoutSucceeded());
      history.push("/login");
    } else {
      action = actions.errorRaised(err.response.status, err.response.data);
    }
  } else {
    action = actions.errorRaised(500, err.message, err.stack);
  }
  if (action) {
    yield put(action);
  }
}

function* refresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  const credentials = yield call(http.refresh, refreshToken);
  connection.set(credentials.accessToken);
  yield put(actions.accountLoginUpdated(connection.account()));
}

function* sendWithRefresh(wsFunc, ...args) {
  try {
    return yield call(wsFunc, connection.get(), ...args);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log("access token expired");
      yield refresh();
      return yield call(wsFunc, connection.get(), ...args);
    } else {
      throw err;
    }
  }
}

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

function receive(message) {
  console.log("message=", message);
  //console.log("connecton=", connection.account());

  switch (message.type) {
    case "connected":
      //TODO - bodge - otherwise socketId is not set before the connected message is received
      setTimeout(() => {
        participant = message.user;
        console.log("id=", message.id, socketId);
        // lowest value of id initialises the peerconnection
        if (message.id < socketId) {
          start().catch(err => {
            console.warn("Failed to call - err=", err);
          });
        } else {
          console.log("We're waiting for connection from peer");
        }
      }, 500);
      break;
    case "offer":
      put({ type: "CHAT_CONNECT_SUCCEEDED", aa: 123, bb: 456 });
      //TODO - check state properly
      if (pc) {
        console.warn("Already in progress");
        return;
      }
      pc = new RTCPeerConnection(pcOptions);
      pc.addEventListener("icecandidate", onIceCandidate);

      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.ontrack = event => {
        console.log("GOT REMOTE STREAM", event);
        if (event.streams[0]) {
          //TODO - do we need to store remoteStream
          remoteStream = event.streams[0];
          console.log("Send chatConnectSucceeded 2");
          store.dispatch(actions.chatConnectSucceeded(participant, remoteStream));

          //put(actions.chatConnectSucceeded(participant, remoteStream));
        }
      };

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
          ws.send(connection.get(), desc);
        });
      break;
    case "answer":
      console.log("GOT AN ANSWER");
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
        console.log("Candidate", message);
        pc.addIceCandidate(message);
      } else {
        console.warn("Unknown message");
      }
  }
}

function start() {
  //TODO is pc truthy - then ignore
  pc = new RTCPeerConnection(pcOptions);
  pc.addEventListener("icecandidate", onIceCandidate);

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  //TODO - don't repeat this function
  pc.ontrack = event => {
    console.log("GOT REMOTE STREAM", event);
    if (event.streams[0]) {
      //TODO - do we need to store remoteStream
      remoteStream = event.streams[0];
      console.log("Send chatConnectSucceeded 1");
      store.dispatch(actions.chatConnectSucceeded(participant, remoteStream));

      //put(actions.chatConnectSucceeded(participant, remoteStream));
    }
  };

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
      ws.send(connection.get(), desc);
    })
    .catch(err => {
      console.log("err=", err);
    });
}

function onIceCandidate(event) {
  console.log("event=", event);
  if (event && event.candidate) {
    ws.send(connection.get(), event.candidate);
  }
}

function* connect(action) {
  console.log("connect saga");
  localStream = action.localStream;
  try {
    socketId = yield sendWithRefresh(ws.connect, receive);
    console.log("socketId=", socketId);
  } catch (err) {
    yield generateError(err);
  }
}

function* disconnect(action) {
  try {
    pc.close();
    yield sendWithRefresh(ws.disconnect);
    yield put(actions.chatDisconnectSucceeded());
  } catch (err) {
    yield generateError(err);
  }
}

export const sagas = [
  takeLatest("CHAT_CONNECT_REQUESTED", connect),
  takeLatest("CHAT_DISCONNECT_REQUESTED", disconnect)
];
