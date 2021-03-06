// Define some variables used to remember state.
var playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
  requestUserUploadsPlaylistId();
}

// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.
function requestUserUploadsPlaylistId() {
  // See https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: "contentDetails"
  });
  request.execute(function(response) {
    playlistId =
      response.result.items[0].contentDetails.relatedPlaylists.uploads;
    requestVideoPlaylist(playlistId);
  });
}
function deleteVid() {
  return gapi.client.youtube.videos
    .delete({
      id: $("#deleteInput").val()
    })
    .then(
      function(response) {
        // Handle the results here (response.result has the parsed body).
        console.log("Response", response);
      },
      function(err) {
        console.error("Execute error", err);
      }
    );
}
function updateVid() {
  return gapi.client.youtube.videos
    .update({
      part: "snippet,status,localizations",
      resource: {
        id: $("#updateInput").val(),
        snippet: {
          categoryId: 22,
          defaultLanguage: "en",
          description: "This description is in English.",
          title: "There is nothing to see here."
        },
        status: {
          privacyStatus: "private"
        },
        localizations: {
          es: {
            title: "no hay nada a ver aqui",
            description: "Esta descripcion es en español."
          }
        }
      }
    })
    .then(
      function(response) {
        // Handle the results here (response.result has the parsed body).
        console.log("Response", response);
      },
      function(err) {
        console.error("Execute error", err);
      }
    );
}
// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
  $("#video-container").html("");
  var requestOptions = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: 10
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute(function(response) {
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? "visible" : "hidden";
    $("#next-button").css("visibility", nextVis);
    prevPageToken = response.result.prevPageToken;
    var prevVis = prevPageToken ? "visible" : "hidden";
    $("#prev-button").css("visibility", prevVis);

    var playlistItems = response.result.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        displayResult(item.snippet);
      });
    } else {
      $("#video-container").html("Sorry you have no uploaded videos");
    }
  });
}

// Create a listing for a video.
function displayResult(videoSnippet) {
  var title = videoSnippet.title;
  var videoId = videoSnippet.resourceId.videoId;
  $("#video-container").append("<p>" + title + " - " + videoId + "</p>");
}

// Retrieve the next page of videos in the playlist.
function nextPage() {
  requestVideoPlaylist(playlistId, nextPageToken);
}

// Retrieve the previous page of videos in the playlist.
function previousPage() {
  requestVideoPlaylist(playlistId, prevPageToken);
}
