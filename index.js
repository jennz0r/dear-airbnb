var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  escape = require('escape-html'),
  crypto = require('crypto'),
  AWS = require('aws-sdk');

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({
  extended: true
}));

AWS.config.update({
  region: "us-west-2",
  endpoint: "dynamodb.us-west-2.amazonaws.com"
});

var dynamodbDoc = new AWS.DynamoDB.DocumentClient();

app.get('/', function (req, res) {
  res.render('index');
});

app.post('/', function (req, res) {
  var data = req.body;
  var letterText = escape(data.letterText);
  var personName = escape(data.personName);

  var shasum = crypto.createHash('md5');

  shasum.update(letterText);
  shasum.update(personName);

  var key = shasum.digest('hex');

  var params = {
    TableName: "dear-airbnb",
    Item: {
      "letterId": key,
      "letterText": letterText,
      "personName": personName,
      "timeCreated": new Date().getTime()
    },
    "ConditionExpression": "attribute_not_exists(letterId)"
  };

  dynamodbDoc.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }

    res.redirect("letter/" + key);
  });
});

app.get('/letter/:id', function(req, res) {
  var id = req.params.id;

  var params = {
    TableName : "dear-airbnb",
    KeyConditionExpression: "letterId = :id",
    ExpressionAttributeValues: {
        ":id": id
    }
  };

  dynamodbDoc.query(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.sendFile(__dirname + '/404.html');
    } else {
      var item = data.Items[0];
      if (item) {
        res.render('letter', {
          letterId: item.letterId,
          letterText: item.letterText,
          personName: item.personName
        });
      }
      else {
        res.sendFile(__dirname + '/404.html');
      }
    }
  });
});

app.use(function(req, res, next) {
  res.status(404);
  
  // respond with html page
  if (req.accepts('html')) {
    res.sendFile(__dirname + '/404.html');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
});