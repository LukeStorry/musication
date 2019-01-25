import React, { Component } from 'react';
import './App.css';
import aws_exports from './aws-exports';
import Amplify, {Auth, Storage, API} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { GoogleApiWrapper, InfoWindow, Marker, Map } from 'google-maps-react';
import CurrentLocation from './Map.js';



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
    this.state = {
      play: true,
      file: null,
      mp3s:[], //stores a list of all the available mp3 keys on S3
      mapping:[], // stores a local copy of the mapping obj
      showingInfoWindow: false, //Hides or the shows the infoWindow
      activeMarker: {}, //Shows the active marker upon click
      selectedPlace: {}, //Shows the infoWindow to the selected place upon a marker
      mappingIndex:0 // remembers the next-updating index in the mapping obj
    };

    this.url = "";
    this.audio = new Audio(this.url);
    this.togglePlay = this.togglePlay.bind(this);

    Storage.list('', { level: 'protected' })
      .then(result => {
        var  mp3list = []
        result.map((obj) => (mp3list.push(obj.key)));
        this.setState({mp3s: mp3list})

        var mapping =[]
        mp3list.map((mp3) => {
          console.log(mapping);
          mapping.push(['0,0', mp3]);})
          this.setState({mapping:mapping})
      })
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
  getMapping = async () => {
    Auth.currentAuthenticatedUser()
      .then(AuthenticatedUser => {
        API.get('musicationApi', '/mappings/' + AuthenticatedUser.username)
          .then(response => {
            console.log(JSON.stringify(response));
            this.setState({mapping:response[0].mapping});
          })
          .catch(error => { console.log("ERROR:", error.response); });
      });
  };
  putMapping = async () => {
    Auth.currentAuthenticatedUser()
      .then(AuthenticatedUser => {
        const params = {
          body: {
            user: AuthenticatedUser.username,
            mapping: this.state.mapping
          }
        }

        API.put('musicationApi', '/mappings', params)
          .then(response => { console.log(JSON.stringify(response)); })
          .catch(error => { console.log("ERROR:", error.response); });
      });
    }

  togglePlay = async () => {
    this.audio.pause();
    this.setState({ play: !this.state.play });

    Auth.currentAuthenticatedUser()
      .then(AuthenticatedUser => {
        navigator.geolocation.getCurrentPosition((position) => {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          console.log(lat, long);
          API.get('musicationApi', '/mappings/' + AuthenticatedUser.username + "/" + lat + "/" + long)
            .then(response => {
              console.log(JSON.stringify(response));
              Storage.get(response.song, { level: 'protected' }) // gets url of mp3
              .then(url => this.url = url)
              this.audio = new Audio(this.url);
              this.audio.load();
              console.log(this.audio);
              this.state.play ? this.audio.play() : this.audio.pause();
            })
            .catch(error => { console.log("ERROR:", error.response); });
      });
    })
  };

  // togglePlay() {
  //   this.updateClosestSongURL();
  //   this.audio.pause();
  //   this.setState({ play: !this.state.play });
  //
  // }


  mapClick = (t, map, coord) => {
    const { latLng } = coord;
    const newlat = latLng.lat();
    const newlng = latLng.lng();
    console.log(newlat, newlng)

    // update the locally stored mapping in a cyclic fashion
    var newMapping = this.state.mapping;
    newMapping[this.state.mappingIndex][0] = newlat+","+newlng;
    var newMappingIndex = (this.state.mappingIndex + 1) % this.state.mapping.length;
    this.setState({mapping:newMapping});
    this.setState({mappingIndex:newMappingIndex})

    return ( < Marker position = { latLng }
      />
    )
  }

  render() {
    console.log(this.state.mp3s);
    console.log(this.state.mapping);
    return (
      <div className="App" >
        <header className="App-header">
          <h1 className="App-title">Musication</h1>
          a Web app for creating and streaming mappings of music to location.
          <p></p>
          <button onClick={this.togglePlay}>Play/Pause</button>
          </header>

        <p className="App-intro">
        <br></br>
        <h3>You can upload mp3s here</h3>
        <br></br>
        <input type="file" onChange={this.chooseFile}/>
        <button onClick={this.uploadFile}>Upload</button>
        <br></br><br></br>
        </p>

        <div>
        <h3>You can create a new MP3:GPS mapping here</h3>
        {
          this.state.mapping.map((item) => {
            console.log(item);
            return(
              <span>
              {item[1]} : {item[0]}
              <br/>
              </span>
            )
          })
        }
        <button onClick={this.getMapping}>Get previously saved Mapping from Cloud</button>
        <button onClick={this.putMapping}>Save Mapping to Cloud</button>

        </div>
        <p> </p>

        <Map
        google={this.props.google}
        zoom={14}
	      onClick={this.mapClick.bind(this)}
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
