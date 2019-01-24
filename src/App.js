import React, { Component } from 'react';
import './App.css';
import aws_exports from './aws-exports';
import Amplify, {Auth, Storage, API} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { GoogleApiWrapper, InfoWindow, Marker, Map } from 'google-maps-react';
import CurrentLocation from './map.js';



/*import {
    Player,
    MediaStates
} from 'react-native-audio-toolkit';*/


Amplify.configure(aws_exports);
Storage.configure({level: 'protected'});

//const play = require('audio-play');
//const load = require('audio-loader');

//var Player = require('player');


 



const mapStyles = {
  map: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      play: true,
      file: null,
      mp3s:[],
      showingInfoWindow: false, //Hides or the shows the infoWindow
      activeMarker: {}, //Shows the active marker upon click
      selectedPlace: {} //Shows the infoWindow to the selected place upon a marker
    };

    this.url = "http://streaming.tdiradio.com:8000/house.mp3";
    this.audio = new Audio(this.url);
    this.togglePlay = this.togglePlay.bind(this);

  }

  togglePlay() {
    this.audio.pause();
    this.setState({ play: !this.state.play });
    this.audio = new Audio(this.url);
    this.audio.load();
    
    console.log(this.audio);
    this.state.play ? this.audio.play() : this.audio.pause();
  }

  // get list of mp3s
  updateMP3sList = () => {
    Storage.list('', { level: 'protected' })
      .then(result => {
        var  mp3list = []
        result.map((obj) => (mp3list.push(obj.key)));
        this.setState({mp3s: mp3list})
      })
  }

  setSelectedMp3 = (result) => {
    function setterFunc (parent) {
      console.log(result.mp3)
      // parent.setState({selectedMP3 : result.mp3})
    }
    return setterFunc
  }


  printMp3URL = async () => {
    Storage.list('', { level: 'protected' })
      .then(result => Storage.get(result[0].key, { level: 'protected' }))
      .then(url => (this.url = url));

      console.log("YYYYYYYXXXXXXXXX")
      console.log(this.url)
    }

  chooseFile = (evt) => {
    const chosen = evt.target.files[0];
    this.setState({ file: chosen });
  }

  uploadFile = () => {
    const file = this.state.file;
    if (file == null) { return; }
    const name = file.name;
    Storage.put(name, file).then(this.setState({ file: null }));

    }

  updateCurrentUsername = () => {
    Auth.currentAuthenticatedUser()
      .then(result => { this.user = result.username });
  }

  // functions to use API get & put
  getAll = async () => {
    Auth.currentAuthenticatedUser()
      .then(AuthenticatedUser => {
        API.get('musicationApi', '/mappings/' + AuthenticatedUser.username)
          .then(response => { console.log(JSON.stringify(response)); })
          .catch(error => { console.log("ERROR:", error.response); });
      });
  };

  closestSong = async () => {
    Auth.currentAuthenticatedUser()
      .then(AuthenticatedUser => {
        var x = 2.1;
        var y = 6.3;
        API.get('musicationApi', '/mappings/' + AuthenticatedUser.username + "/" + x + "/" + y)
          .then(response => { console.log(JSON.stringify(response)); })
          .catch(error => { console.log("ERROR:", error.response); });
      });
  };

  put = async () => {
    Auth.currentAuthenticatedUser()
      .then(AuthenticatedUser => {
        const params = {
          body: {
            user: AuthenticatedUser.username,
            mapping: [
              ['1.2345,6.345', 'song4'],
              ['2.345,7.345', 'song5'],
              ['3.2345,8.345', 'song6']
            ]
          }
        }

        API.put('musicationApi', '/mappings', params)
          .then(response => { console.log(JSON.stringify(response)); })
          .catch(error => { console.log("ERROR:", error.response); });
      });
  }

  onClick(t, map, coord) {
    const { latLng } = coord;
    const newlat = latLng.lat();
    const newlng = latLng.lng();
    console.log(newlat, newlng)
    return ( < Marker position = { latLng }
      />
    )
  }

  render() {
    this.updateMP3sList();
    return (
      <div className="App" >
        <header className="App-header">
          <h1 className="App-title">Musication</h1>
          a Web app for creating and streaming mappings of music to location.
          </header>

        <p className="App-intro">
        <br></br>
        You can upload mp3s here
        <br></br>
        <input type="file" onChange={this.chooseFile}/>
        <button onClick={this.uploadFile}>Upload</button>
        <br></br><br></br>
        </p>

        <p>
        Here are some test buttons:
        <br></br>
        <button onClick={this.printMp3URL}>Log url of first uploaded file to console</button>
        <button onClick={this.getAll}>API getAll</button>
        <button onClick={this.closestSong}>API get closest</button>
        <button onClick={this.put}>API put</button>
        <button onClick={this.togglePlay}>u h h h h h play a song</button>
        </p>
        <p>
        <tbody>
          {
            this.state.mp3s.map((mp3) => {
              return <button onClick={this.setSelectedMp3({mp3})}> {mp3} </button>
            })
          }
        </tbody>
        </p>

        <Map
        google={this.props.google}
        zoom={14}
	      onClick={this.onClick}
        style={mapStyles}
        initialCenter={{
         lat: 51.454514,
         lng: -2.587910
        }}
      >
	    <Marker
                title={'The marker`s title will appear as a tooltip.'}
                name={'SOMA'}
                position={{lat: 37.778519, lng: -122.405640}} />
	    </Map>

    </div>
    );
  };
 }

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDM6x6cs7CqMIMdVCi5thUtzj65u2IFeOo'
})(withAuthenticator(App, true));
