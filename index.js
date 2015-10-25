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
  endpoint: "http://localhost:8000"
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
  });

  res.redirect(key);
});

app.get('/:id', function(req, res) {
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
    } else {
      data.Items.forEach(function(item) {
        res.render('letter', {
          letterText: item.letterText,
          personName: item.personName
        });
        return;
      });
    }
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
});