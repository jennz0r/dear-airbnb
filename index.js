var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  sanitize = require('sanitize-html'),
  escape = require('escape-html'),
  crypto = require('crypto'),
  data;

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({
  extended: true
}));


app.get('/', function (req, res) {
  res.render('index', {title: 'The Index!'})
});

app.post('/', function (req, res) {
  data = req.body;
  var letterText = data.letterText;
  var personName = data.personName;

  var shasum = crypto.createHash('md5');

  shasum.update(letterText);
  shasum.update(personName);

  var key = shasum.digest('hex');

  var params = {
      TableName: "dear-airbnb",
      Item: {
          "letter-id": key,
          "letterText": escape(data.letterText),
          "personName": escape(data.personName),
          "timeCreated": '123'
      },
      "ConditionExpression": "attribute_not_exists(letter-id)"
  };

  res.redirect(key);
});

app.get('/:id', function(req, res) {
  res.render('letter', {
    letterText: escape(data.letterText),
    personName: escape(data.personName)
  });
});
 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});