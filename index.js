import _ from "lodash";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import YTSearch from "youtube-api-search";

//Components
import Search from "./components/Search";
import VideoList from "./components/VideoList";
import VideoDetail from "./components/VideoDetails";

let GoogleAuth;

const API_KEY = "AIzaSyB_3zIpSArggwwgfWkOxc9yh9f4BQ3lWUY";
const CLIENT_ID =
  "1034925747541-po2gk9n45oi19mv23kidjts57u6446a0.apps.googleusercontent.com";
const SCOPES =
  "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload";
const DISCOVERY_URL =
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videos: [],
      selectedVideo: null
    };
    this.videoSearch("nails");
    this.handleClientLoad();
  }
  handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load("client:auth2", this.initClient());
  }
  initClient() {
    console.log("111111111111");
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: DISCOVERY_URL
      })
      .then(function() {
        console.log("22222222");

        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(this.updateSigninStatus());

        // Handle initial sign-in state. (Determine if user is already signed in.)
        const user = GoogleAuth.currentUser.get();
        setSigninStatus();
      });
  }
  handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
      // User is authorized and has clicked 'Sign out' button.
      GoogleAuth.signOut();
    } else {
      // User is not signed in. Start Google auth flow.
      GoogleAuth.signIn();
    }
  }

  revokeAccess() {
    GoogleAuth.disconnect();
  }

  setSigninStatus(isSignedIn) {
    const user = GoogleAuth.currentUser.get();
    const isAuthorized = user.hasGrantedScopes(SCOPES);
    if (isAuthorized) {
      console.log("AUTHORIZED");
      console.log(
        "You are currently signed in and have granted access to this app."
      );
    } else {
      console.log("NOT AUTHORIZED");
      console.log("You have not authorized this app or you are signed out.");
    }
  }

  updateSigninStatus(isSignedIn) {
    this.setSigninStatus();
  }
  videoSearch(term) {
    YTSearch({ key: API_KEY, term: term }, videos => {
      this.setState({
        videos: videos,
        selectedVideo: videos[0]
      });
    });
  }
  render() {
    const videoSearch = _.debounce(term => {
      this.videoSearch(term);
    }, 300);
    return (
      <div>
        <div>
          <button
            id="sign-in-or-out-button"
            onClick={() => {
              this.handleAuthClick();
            }}
            style={signInStyle}
          >
            Sign In/Authorize
          </button>
          <button
            id="revoke-access-button"
            onClick={() => {
              this.revokeAccess();
            }}
            style={provokeStyle}
          >
            Revoke access
          </button>

          <div id="auth-status" style={authStyle} />
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Search onSearchTermChange={videoSearch} />
          </div>
          <div className="col-sm-12 col-lg-8">
            <VideoDetail video={this.state.selectedVideo} />
          </div>
          <div className="col-sm-12 col-lg-4">
            <VideoList
              onVideoSelect={selectedVideo => this.setState({ selectedVideo })}
              videos={this.state.videos}
            />
          </div>
        </div>
      </div>
    );
  }
}
const signInStyle = {
  marginLeft: "25px"
};
const provokeStyle = {
  marginLeft: "25px",
  display: "none"
};
const authStyle = {
  paddingLeft: "25px",
  display: "inline"
};
ReactDOM.render(<App />, document.querySelector(".container"));
