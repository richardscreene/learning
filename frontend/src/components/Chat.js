import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";

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
    //TODO - can I use localVideo.srcObject???
    this.localSteam = null;
  }

  componentDidMount() {
    console.log("Mounting the chat page");

    //TODO- include audio
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

  componentWillUnmount() {
    this.props.chatDisconnectRequested();
  }

  componentDidUpdate(prevProps) {
    console.log("nextProps=", prevProps, this.props);
    if (this.props.remoteStream !== prevProps.remoteStream) {
      console.log("remote stream has changed");
      this.remoteVideo.current.srcObject = this.props.remoteStream;
      this.setState({
        isConnecting: !this.props.remoteStream
      });
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
  errorCallback(error) {
    console.error("navigator.getUserMedia error: ", error);
  }

  onClick(e) {
    const target = e.target;
    console.log("Chatting....");
    this.setState({
      isConnecting: true
    });
    this.props.chatConnectRequested(this.localStream);

    e.preventDefault();
  }

  //TODO - on success
  //this.remoteVideo.current.srcObject = event.streams[0];

  //TODO - hide button while call is being established
  render() {
    console.log("props=", this.props);
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

        <div>{this.props.participant && this.props.participant.email}</div>

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
