var express = require('express')
var app = express();
var sanitize = require('sanitize-html');
var escape = require('escape-html');

app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', function (req, res) {
  res.render('index', {title: 'The Index!'})
});

app.post('/', function (req, res) {
  // this is probably where i'm gonna put stuff in the db
  // then redirect peeps?
  res.send('Got a POST request');
});
 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});