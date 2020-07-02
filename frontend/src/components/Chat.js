import React from "react";
import { Form, Button } from "react-bootstrap";

//import { Link } from "react-router-dom";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faUser } from "@fortawesome/free-solid-svg-icons";
import socketio from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:3001";
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

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localSource: null,
      remoteSource: null
    };
    this.input = React.createRef();
    this.localVideo = React.createRef();
    this.remoteVideo = React.createRef();

    this.localSteam = null;
  }

  componentDidMount() {
    console.log("Mounting the home page");
    //TODO - this should be moved to API so it can use the same token
    this.socketio = socketio(ENDPOINT, {
      transportOptions: {
        polling: {
          extraHeaders: {
            authorization: "some shit"
          }
        }
      }
    });

    this.socketio.on("connect", () => {
      console.log("connected");
      this.socketio.on("message", message => {

        console.log("RX MSG=", message);

        if (message.type === "offer") {
          //TODO - check state properly
          if (!this.pc) {
            console.warn("Already in progress");
          }
          this.pc = new RTCPeerConnection(pcOptions);
          this.pc.addEventListener("icecandidate", this.onIceCandidate.bind(this));

          this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));

          this.pc.ontrack = (event) => {
            console.log("GOT REMOTE STREAM");
            this.remoteVideo.current.srcObject = event.streams[0];
          };

          this.pc.setRemoteDescription(message).then(() => {
            console.log("A");
            return this.pc.createAnswer(answerOptions);
          }).then((desc) => {
            console.log("B");
            return this.pc.setLocalDescription(desc).then(() => {
              return Promise.resolve(desc);
            });
          }).then((desc) => {
            console.log("C");
            this.socketio.emit("message", desc);
          });
        } else if (message.type === "answer") {
          console.log("GOT AN ANSWER");
          this.pc.setRemoteDescription(message).then(() => {
            console.log("Set remote descriptioN");
          }).catch((err) => {
            console.warn("Failed ot set remote", err);
          });
        } else if (typeof message.candidate === "string") {
          console.log("Candidate", message);
          this.pc.addIceCandidate(message);
        }
      });
    });

    this.initialise();
  }

  //TODO - show local smaller....
  onSubmit(e) {
    const target = e.target;
    console.log("Message=", this.input.current.value);
    this.socketio.emit("message", this.input.current.value);
    e.preventDefault();
  }

  successCallback(stream) {
    console.log("strem", stream);
    this.localStream = stream;
    this.localVideo.current.srcObject = stream;
    /*    this.setState({
      remoteSource: stream
    });
    */
  }

  //TODO - hangup
  call() {
    this.pc = new RTCPeerConnection(pcOptions);
    this.pc.addEventListener("icecandidate", this.onIceCandidate.bind(this));

    this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));

    //TODO - don't repeat
    this.pc.ontrack = (event) => {
      console.log("GOT REMOTE STREAM");
      this.remoteVideo.current.srcObject = event.streams[0];
    };

    this.pc
      .createOffer(offerOptions)
      .then(desc => {
        console.log("offer=", desc);
        return this.pc.setLocalDescription(desc).then(() => {
          return Promise.resolve(desc);
        });
      })
      .then(desc => {
        console.log("Set local descroption");
        //TODO - include name/userId in offer/answer message
        this.socketio.emit("message", desc);
      })
      .catch(err => {
        console.log("err=", err);
      });
  }

  onIceCandidate(event) {
    console.log("event=", event);
    if (event && event.candidate) {
      this.socketio.emit("message", event.candidate);
    }
  }

  errorCallback(error) {
    console.error("navigator.getUserMedia error: ", error);
  }

  initialise() {
    const constraints = { audio: false, video: true };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        this.successCallback(stream);
      })
      .catch(error => {
        this.errorCallback(error);
      });
}

  onClick(e) {
    const target = e.target;
    console.log("Chatting....");
    this.call();
    e.preventDefault();
  }

  //TODO - hide button while call is being established
  render() {
    return (
      <>
        <Button
          onClick={this.onClick.bind(this)}
          variant="primary"
          size="lg"
          block
        >
          Chat!
        </Button>

        <video autoPlay={true} ref={this.localVideo}></video>
          <video id="localVideo" autoPlay={true} ref={this.remoteVideo}></video>

        <Form onSubmit={this.onSubmit.bind(this)}>
          <Form.Group>
            <Form.Label>Message</Form.Label>
            <Form.Control
              type="string"
              name="message"
              placeholder="A message to be sent"
              defaultValue=""
              required
              ref={this.input}
            />
          </Form.Group>
        </Form>
      </>
    );
  }
}
