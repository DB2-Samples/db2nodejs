'use strict';
var express = require('express');

var app = express();

app.get('/', function(req,res){
    res.send('Hello World');
});

app.listen(8888);

console.log('Express started on port 8888');