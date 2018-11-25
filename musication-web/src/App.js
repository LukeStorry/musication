import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import aws_exports from './aws-exports';
import Amplify, { Analytics, Storage } from 'aws-amplify';
import { withAuthenticator, S3Album } from 'aws-amplify-react';


Amplify.configure(aws_exports);
Storage.configure({ level: 'protected' });

class App extends Component {
  uploadFile = (evt) => {
    const file = evt.target.files[0];
    const name = file.name;

    Storage.put(name, file).then(() => {
      this.setState({ file: name });
    })
  }

  componentDidMount() {
    Analytics.record('Amplify_CLI');
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
	    <h2> Musication </h2>
	    <p> You can upload mp3s below </p>
        </header>
	<p> Pick a file</p>
          <input type="file" onChange={this.uploadFile} />
        <S3Album level="private" path='' />
      </div>
    );
  }
}

export default withAuthenticator(App, true);
