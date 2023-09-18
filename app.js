// app.js
var express = require('express');
var app = express();

var Websocket = require('./models/Websocket');
app.use(express.static('html'));

module.exports = app;