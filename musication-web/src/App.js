import React, { Component } from 'react';
import './App.css';
import aws_exports from './aws-exports';
import Amplify, { Analytics, Storage, API, graphqlOperation} from 'aws-amplify';
import { withAuthenticator, S3Album } from 'aws-amplify-react';


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

    Storage.list('', { level: 'protected' })
    .then(result => console.log(result));
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


  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <h2>Musication</h2>
          <p> You can upload mp3s here </p>
          <br></br>
          <input type="file" onChange={this.chooseFile}/>
          <button onClick={this.uploadFile}>Upload</button>
        </header>
        <p>
          <button onClick={this.listQuery}>Test - GraphQL List Query</button>
          <button onClick={this.todoMutation}>Test - GraphQL addMapping Mutation</button>
        </p>

        <S3Album level="protected" path='' />

      </div>
    );
  }
}

export default withAuthenticator(App, true);
