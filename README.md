# Musication
### A Cloud-based web app for creating and streaming mappings of music to location.


Input 1: MP3 Uploads

Input 2: Interactive of "MusicalMapping" playlists

Output: Music streaming based on GPS



---

## Usage
Once the repo is cloned, run:

```bash
npm install -g @aws-amplify/cli
amplify configure
npm install
amplify configure project
amplify serve
```
---

## Filesystem
We used the default Amplify filesystem:

`/src` contains all our front-end code, with a simple react app, api-calling functions, and a map.

`/amplify/backend` contains the AWSTemplateFormat and CloudFormation documents for provisioning our cloud services.\
This was mostly all generated with Amplify, but the `/function/musicationApiLambda/src/app.js` file was re-written to expand the linked musicationApi by adding Lambdas, for example for calculating the closest mp3 to a given location.

---

*Created for the COMSM0010 - Cloud Computing Coursework Project*
