import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";

//import { Link } from "react-router-dom";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faUser } from "@fortawesome/free-solid-svg-icons";
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
      remoteSource: null,
      isConnecting: false
    };
    this.input = React.createRef();
    this.localVideo = React.createRef();
    this.remoteVideo = React.createRef();

    this.localSteam = null;
  }

  componentDidMount() {
    console.log("Mounting the home page");
    this.props.chatConnectRequested();

    /*

      this.socketio.on("message", message => {
        console.log("RX MSG=", message);

        if (message.type === "offer") {
          //TODO - check state properly
          if (this.pc) {
            console.warn("Already in progress");
            return;
          }
          this.pc = new RTCPeerConnection(pcOptions);
          this.pc.addEventListener(
            "icecandidate",
            this.onIceCandidate.bind(this)
          );

          this.localStream
            .getTracks()
            .forEach(track => this.pc.addTrack(track, this.localStream));

          this.pc.ontrack = event => {
            console.log("GOT REMOTE STREAM", event);
            if (event.streams[0]) {
              this.remoteVideo.current.srcObject = event.streams[0];
            }
          };

          this.pc
            .setRemoteDescription(message)
            .then(() => {
              console.log("A");
              return this.pc.createAnswer(answerOptions);
            })
            .then(desc => {
              console.log("B");
              return this.pc.setLocalDescription(desc).then(() => {
                return Promise.resolve(desc);
              });
            })
            .then(desc => {
              console.log("C");
              this.socketio.emit("message", desc);
            });
        } else if (message.type === "answer") {
          console.log("GOT AN ANSWER");
          this.pc
            .setRemoteDescription(message)
            .then(() => {
              console.log("Set remote descriptioN");
            })
            .catch(err => {
              console.warn("Failed ot set remote", err);
            });
        } else if (typeof message.candidate === "string") {
          console.log("Candidate", message);
          this.pc.addIceCandidate(message);
        }
      });
    });
*/
    this.initialise();
  }

  componentWillUnmount() {
    if (this.pc) {
      this.pc.close();
    }
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
    //TODO is this.pc truthy - then ignore
    this.pc = new RTCPeerConnection(pcOptions);
    this.pc.addEventListener("icecandidate", this.onIceCandidate.bind(this));

    this.localStream
      .getTracks()
      .forEach(track => this.pc.addTrack(track, this.localStream));

    //TODO - don't repeat this function
    this.pc.ontrack = event => {
      console.log("GOT REMOTE STREAM", event);
      if (event.streams[0]) {
        this.remoteVideo.current.srcObject = event.streams[0];
      }
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
        this.props.chatMessageRequested({ type: "connect" });
      })
      .catch(err => {
        console.log("err=", err);
      });
  }

  onIceCandidate(event) {
    console.log("event=", event);
    if (event && event.candidate) {
      this.props.chatMessageRequested(event.candidate);
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
    this.setState({
      isConnecting: true
    });

    this.props.chatMessageRequested({ type: "connect" });
    // on succeeded then this.call();


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
          {this.state.isConnecting ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Connect!"
          )}
        </Button>

        <div
          style={{
            position: "relative",
            display: "inline-block",
            minWidth: "500px",
            minHeight: "auto"
          }}
        >
          <div
            style={{
              display: "inline-block",
              zIndex: 2
            }}
          >
            <video autoPlay={true} ref={this.remoteVideo}></video>
          </div>
          <div
            style={{
              position: "absolute",
              top: "80%",
              left: "80%",
              display: "inline-block",
              zIndex: 1
            }}
          >
            <video
              width="100px"
              height="auto"
              autoPlay={true}
              ref={this.localVideo}
              muted
            ></video>
          </div>
        </div>
      </>
    );
  }
}
