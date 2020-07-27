import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnecting: false
    };
    this.localVideo = React.createRef();
    this.remoteVideo = React.createRef();
  }

  componentDidMount() {
    console.log("Mounting the chat page");

    const constraints = { audio: true, video: true };

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

        <div
          style={{
            position: "relative",
            display: "inline-block",
            minWidth: "500px",
            minHeight: "auto"
          }}
        >
          {this.props.participant && this.props.participant.name && (
            <div
              style={{
                position: "absolute",
                top: "5%",
                left: "5%",
                display: "inline-block",
                zIndex: 1
              }}
            >
              <p>{this.props.participant.name}</p>
            </div>
          )}

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
