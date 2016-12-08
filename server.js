var express = require('express');
var messenger = require('./routes/messenger');
var logger = require('morgan');
var bodyParser = require('body-parser');
var conf = require('./conf/conf');

//var port = (process.env.PORT || 3000);
var port = (process.env.VCAP_APP_PORT || conf.nodeport);

var app = express();

app.use(logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
app.use(bodyParser.json());

console.log('registering messenger routes with express');
app.post('/messenger', messenger.sendMessage);


console.log('About to start listening');
app.listen(port);
console.log('Listening on port: ', port);
