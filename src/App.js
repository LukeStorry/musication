import React, { Component } from 'react';
import './App.css';
import aws_exports from './aws-exports';
import Amplify, { Analytics, Storage, API, graphqlOperation} from 'aws-amplify';
import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import { withAuthenticator } from 'aws-amplify-react';
import CurrentLocation from './Map';

Amplify.configure(aws_exports);
Storage.configure({level: 'protected'});


const listMappings = `query listMappings {
  listMapping{
    items{
      id
      name
      author
      description
      mp3s
      locations
    }
  }
}`

const addMapping = `mutation createMapping($name:String! $description: String!) {
  createMapping(input:{
    name:$name
    author:$author
    description:$description
    mp3s:$mp3s
    locations:$locations

  }){
    id
    name
    author
    description
    mp3s
    locations
  }
}`

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { file: null };
  }

  printMp3URL = (key) => {
    Storage.get(key, { level: 'protected' })
    .then(result => console.log(result))
  }


  listUploadedFiles = () => {
    Storage.list('', { level: 'protected' })
    .then(result => this.printMp3URL(result[1].key));

  }

  chooseFile = (evt) => {
    const chosen = evt.target.files[0];
    this.setState({file: chosen});
  }

  uploadFile = () => {
    const file = this.state.file;
    if (file == null) { return; }
    const name = file.name;

    Storage.put(name, file).then(this.setState({file: null}));
  }

  componentDidMount() {
    Analytics.record('Amplify_CLI');
  }

  mappingMutation = async () => {
    const mappingDetails = {
      name: 'My First MusicMapping',
      author: 'luke',
      description: 'test mapping',
      mp3s: ['mp31.mp3', 'mp32.mp3'],
      locations: ['1243.56,12535.67', '1243.65,12345.87']
    };

    const newEvent = await API.graphql(graphqlOperation(addMapping, mappingDetails));
    alert(JSON.stringify(newEvent));
  }

  listQuery = async () => {
    console.log('listing mappings');
    const allMappings = await API.graphql(graphqlOperation(listMappings));
    alert(JSON.stringify(allMappings));
  }

  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {}
  };

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

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
          <button onClick={this.listUploadedFiles}>Log uploaded files to console</button>
          <button onClick={this.listQuery}>GraphQL List Query</button>
          <button onClick={this.todoMutation}>GraphQL addMapping Mutation</button>
        </p>
	    <CurrentLocation
        centerAroundCurrentLocation
        google={this.props.google}
      >
        <Marker onClick={this.onMarkerClick} name={'current location'} />
        <InfoWindow
          marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}
          onClose={this.onClose}
        >
        </InfoWindow>
      </CurrentLocation>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDM6x6cs7CqMIMdVCi5thUtzj65u2IFeOo'
})(withAuthenticator(App, true));
