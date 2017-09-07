'use strict';
var fs=require('fs');
var path = require('path');
const fileName = 'db2cred.json';
var file = path.join(__dirname,fileName);
console.log(file);
var writeCred = (credList) => {
    fs.writeFileSync(file, JSON.stringify(credList));
}
var readCred = () => {
    return JSON.parse(fs.readFileSync(file));
}
var user_cred = function() {
    this.write = (credList) => writeCred(credList);
    this.read = () => readCred();
}
module.exports.users = user_cred;