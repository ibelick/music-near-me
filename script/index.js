/* SONGKICK */
function locationSearch() {
  var API_LOCATION = "http://api.songkick.com/api/3.0/search/locations.json?query="
  var city = $("#searchCity").val().replace(/\s/g,'_');
  var API_KEY_SONGKICK = "&apikey=tIhpFoFn0dWpQ72A"
  var linkCity = API_LOCATION+city+API_KEY_SONGKICK+"&jsoncallback=?";
  getLocationData(linkCity);
}

function locationLink(city) {
  var API_LOCATION = "http://api.songkick.com/api/3.0/search/locations.json?query="
  var API_KEY_SONGKICK = "&apikey=tIhpFoFn0dWpQ72A"
  var linkCity = API_LOCATION+city+API_KEY_SONGKICK+"&jsoncallback=?";
  getLocationData(linkCity);
}

function getArtistLocation(uri) {
  var API_METRO = "http://api.songkick.com/api/3.0/metro_areas/"
  var API_KEY_SONGKICK = "/calendar.json?apikey=tIhpFoFn0dWpQ72A";
  var linkArtistLocation = API_METRO+uri+API_KEY_SONGKICK+"&jsoncallback=?";

  getArtistLocationData(linkArtistLocation);
}

function getLocationData(linkCity) {
  $.getJSON(linkCity, function(data) {
    var uri = getValues(data,'id')[0];
    getArtistLocation(uri);
  });
}

function getArtistLocationData(linkArtistLocation) {
  $.getJSON(linkArtistLocation, function(data) {
    var resultsPage = data.resultsPage;
    var results = resultsPage.results;
    var event = results.event;
    // 1 => event.length
    for (var i = 0; i < 2; i++) {
      var event_location = event[i].displayName;
      var event_url = event[i].uri;
      var events = event[i].performance;
      for (var j = 0; j < events.length ; j++) {
        var artist_name = events[j].displayName;
        getArtist(artist_name, event_location, event_url);
      }
    }
  });
}

$("#buttonCity").click( function() {
  locationSearch();
 }
);

$("#getLocation").click( function() {
  $.ajax({
    url: "https://geoip-db.com/jsonp",
    jsonpCallback: "callback",
    dataType: "jsonp",
    success: function( location ) {
      var cityLocation = location.city+"_"+location.country_name;
      locationLink(cityLocation);
    }
  });
});


/* DEEZER API */
function getArtist(artist, event_location, event_url) {
  var API_DEEZER = "https://api.deezer.com/search/artist?output=jsonp&q="
  artist = artist.replace(/\s/g,'_');
  var linkArtist = API_DEEZER+artist+"&callback=?";
  $.getJSON(linkArtist, function(data) {
    var artist_ID = getValues(data, 'id')[0];
      // if artist exist w/ Deezer
      if (artist_ID != null) {
        console.log(event_location);
        getArtistData(artist_ID, event_location, event_url);
      }
  });
}

function getArtistData(artist_ID, event_location, event_url) {
  var linkArtistData = "https://api.deezer.com/artist/"+artist_ID+"?output=jsonp&q=&callback=?";
  $.getJSON(linkArtistData, function(data) {
    var artistArtist_name = getValues(data,'name')[0];
    var artistArtist_link = getValues(data,'link');
    var artistArtist_img = getValues(data,'picture')[0];
    var html = "<div class='infos_"+artistArtist_name+" artistInfo''>";
    html+="<h3>"+artistArtist_name+"</h3>";
    html+="<p>"+event_location+"</p>";
    html+="<a href="+event_url+" target='_blank'>See "+artistArtist_name+"</a>";
    html+="<a href="+artistArtist_link+" target='_blank'>Discover "+artistArtist_name+"</a>";
    html+="<img src="+artistArtist_img +" alt="+artistArtist_name+" />";
    html+="</div>";
    $(".artistInfos").append(html);
    getArtistTracklist(artist_ID);
  });
}

function getArtistTracklist(artist_ID) {
  // get artist song
  var linkArtistTrack = "https://api.deezer.com/artist/"+artist_ID+"/top?output=jsonp&q=limit=50&callback=?";
  $.getJSON(linkArtistTrack, function(data) {
    var track = data.data;
    for (var i = 0; i < track.length; i++) {
      var artistSong_title = track[i].title;
      var artistSong_MP3 = track[i].preview;
      $(".artistInfo").append("<h3>"+artistSong_title+"</h3>")
      $(".artistInfo").append("<audio src="+artistSong_MP3+" controls='controls'></audio>");
    }
  });
}

$("#buttonArtist").click( function() {
  getArtist();
 }
);

//return an array of values that match on a certain key
function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

//return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}
