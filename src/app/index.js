'use strict';
var express = require('express');
var path = require('path');
var IO = require('socket.io');
var router = express.Router();

var app = express();

app.get('/', function(req,res){
    res.send('Hello World');
});

app.listen(8888);

console.log('Express started on port 8888');