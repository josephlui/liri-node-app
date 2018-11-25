require("dotenv").config();
var keys = require("./keys");
var Spotify = require('node-spotify-api');
var axios = require("axios");
var fs = require("fs");

var command = process.argv;

// read from random.txt the command line arguments
if (process.argv[2] === 'do-what-it-says'){
    fs.readFile('./random.txt', "UTF8", (err, data) => {
        if (err) throw err;
        data = data.split(',');
        if (data.length === 2) {
            command[2] = data[0];
            command[3] = data[1];
        }
        processCommandLineArgument(command);
    });
}else {
    // process command line arguments
    processCommandLineArgument(command);
}

// process command line arguments
function processCommandLineArgument(cmdArgs){

    if (cmdArgs.length > 3){
        var pgm = cmdArgs[2];
        var data = cmdArgs.slice(3).join(' ');
       
        switch (pgm) {
            case 'concert-this':
                break;
            case 'spotify-this-song':
                spotify_this_song (data);
                break;
            case 'movie-this':
                movie_this(data);    
                break;
            default:
                console.log ("command not supported");
            
        }
    } else {
        console.log ("missing argument, please try again");
    }

}

function concert_this(){
    console.log ("This function is currently not supported");
}

function spotify_this_song(name){
    var spotify = new Spotify(keys.spotify);

    var defaultSong = "The Sign";
    spotify.search({ type: 'track', query: name, limit: 1  }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } 
        var numSongs = data.tracks.items.length;
        if (numSongs == 0){
            // search for default song
            spotify.search({ type: 'track', query: defaultSong, limit: 50  }, function(err, data) {
                for (var i = 0; i < data.tracks.items.length; i++){        
                    if (data.tracks.items[i].album.name=== 'The Sign'){
                         parseSpotifyResponse(data.tracks.items[i]);
                    }
                }
            });
        } else {
            parseSpotifyResponse(data.tracks.items[0]);
        }
     
    });
  
}

function parseSpotifyResponse(resp){
    var artists = '';
    var artistName = [];

    artists = resp.artists;
    for (var y = 0; y < artists.length; y++){
        artistName.push(artists[y].name);
    }
    console.log ("Artist: " + artistName.join(', '));
    console.log ("Song's Name: " + resp.name);
    console.log ("Spotify's preview link: " + resp.href);
    console.log ("Album: " + resp.album.name);
  
}

function movie_this(movie){

  var defaultMovie = 'http://www.omdbapi.com/?type=movie&apikey=29a60cf1&t=Mr. Nobody';
  var omdbURL = 'http://www.omdbapi.com/?type=movie&apikey=29a60cf1&t=' + movie;
  axios.get(omdbURL)
  .then(function (response) {
      
      if (response.data.Response != 'False'){
        parseOMDBResponse(response.data);
      }else {
        axios.get(defaultMovie).
        then(function(resp){
            if (resp.data.Response != 'False'){
                parseOMDBResponse(resp.data);
            }
        }
        ).catch(function (error) {
            console.log(error);
        });
      }
    
  })
  .catch(function (error) {
    console.log(error);
  });

}

function parseOMDBResponse(resp){

    console.log ("Title: " + resp.Title);
    console.log ("Year: " + resp.Year);
    console.log ("IMDB Rating: " + resp.imdbRating);
    for (var i = 0; i < resp.Ratings.length; i++){
        if (resp.Ratings[i].Source === 'Rotten Tomatoes'){
            console.log ("Rotten Tomateoes Rating: "+ resp.Ratings[i].Value);
        }
    }
    console.log ("Country: " + resp.Country);
    console.log ("Language: " + resp.Language);
    console.log ("Plot: " + resp.Plot);
    console.log ("Actors: " + resp.Actors);

}
