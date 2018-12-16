import React, { Component } from 'react';
import './App.css';
import aws_exports from './aws-exports';
import Amplify, { Analytics, Storage, API} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

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


// File uploading stuff
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


  // API stuff
    post = async () => {
      console.log('calling api');
      var mapping = [['1.2345,6.345', 'song1'],
                ['2.345,7.345', 'song3'],
                ['3.2345,8.345', 'song2']];
      const response = await API.post('restapi', '/items', {
        body: {
          id: '1',
          name: 'first mapping!'
          mapping: mapping,
        }
      });
      alert(JSON.stringify(response, null, 2));
    }
    get = async () => {
      console.log('calling api');
      const response = await API.get('restapi', '/items/object/1');
      alert(JSON.stringify(response, null, 2));
    }
    list = async () => {
      console.log('calling api');
      const response = await API.get('restapi', '/items/1');
      alert(JSON.stringify(response, null, 2));
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
          <button onClick={this.listUploadedFiles}>Log uploaded files to console</button>
          <button onClick={this.post}>API Post</button>
          <button onClick={this.get}>API get</button>
          <button onClick={this.list}>API list</button>
        </p>
      </div>
    );
  }
}

export default withAuthenticator(App, true);
