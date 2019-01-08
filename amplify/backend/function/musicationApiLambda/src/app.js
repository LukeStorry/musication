/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "mappings";

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyType = "S";
const path = "/mappings";
const UNAUTH = 'UNAUTH';


// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


/********************************
 * HTTP Get method for listing the mapping objects *
 ********************************/

app.get(path + '/:user', function(req, res) {
  var condition = {}
  condition["user"] = {
    ComparisonOperator: 'EQ'
  }

  if (userIdPresent && req.apiGateway) {
    condition["user"]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH];
  } else {
    try {
      condition["user"]['AttributeValueList'] = [req.params["user"]];
    } catch (err) {
      res.json({ error: 'Wrong column type ' + err });
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition
  }

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.json({ error: 'Could not load items: ' + err });
    } else {
      res.json(data.Items);
    }
  });
});


/*****************************************
 * HTTP Get method for get closest song id *
 *****************************************/
app.get(path + '/:user/:x/:y', function(req, res) {
  var condition = {}
  condition["user"] = {
    ComparisonOperator: 'EQ'
  }

  if (userIdPresent && req.apiGateway) {
    condition["user"]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH];
  } else {
    try {
      condition["user"]['AttributeValueList'] = [req.params["user"]];
    } catch (err) {
      res.json({ error: 'Wrong column type ' + err });
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition
  }

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.json({ error: 'Could not load items: ' + err });
    } else {
      var coordinates = [parseFloat(req.params.x), parseFloat(req.params.y)];
      var chosen = { song: '', distance: Number.POSITIVE_INFINITY };
      data.Items[0].mapping.forEach(function(mapping) {
        var songCoordinates = mapping[0].split(',');
        var deltax = coordinates[0] - parseFloat(songCoordinates[0]);
        var deltay = coordinates[1] - parseFloat(songCoordinates[1]);
        var distance = Math.pow(deltax, 2) + Math.pow(deltay, 2)
        if (distance < chosen.distance) {
          chosen.song = mapping[1];
          chosen.distance = distance;
        }
      })
      res.json(chosen);
    }
  });
});


/************************************
 * HTTP put method for insert object *
 *************************************/

app.put(path, function(req, res) {

  if (userIdPresent) {
    req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: 'put call succeed!', url: req.url, data: data })
    }
  });
});


app.listen(3000, function() {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
