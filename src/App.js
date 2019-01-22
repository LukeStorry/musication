import React, { Component } from 'react';
import './App.css';
import aws_exports from './aws-exports';
import Amplify, {Auth, Storage, API} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { GoogleApiWrapper, InfoWindow, Marker, Map } from 'google-maps-react';
import CurrentLocation from './Map';

Amplify.configure(aws_exports);
Storage.configure({level: 'protected'});


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
    this.state = { file: null };
  }

  printMp3URL = () => {
    Storage.list('', { level: 'protected' })
      .then(result => Storage.get(result[0].key, { level: 'protected' }))
      .then(url => console.log(url));
  }


  // File uploading stuff
  listUploadedFiles = () => {
    Storage.list('', { level: 'protected' })
      .then(result => console.log(result));
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


  state = {
    showingInfoWindow: false, //Hides or the shows the infoWindow
    activeMarker: {}, //Shows the active marker upon click
    selectedPlace: {} //Shows the infoWindow to the selected place upon a marker
  };

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
        <button onClick={this.listUploadedFiles}>Log uploaded files to console</button>
        <button onClick={this.getAll}>API getAll</button>
        <button onClick={this.closestSong}>API get closest</button>
        <button onClick={this.put}>API put</button>
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
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDM6x6cs7CqMIMdVCi5thUtzj65u2IFeOo'
})(withAuthenticator(App, true));
