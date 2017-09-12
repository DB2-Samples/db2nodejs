'use strict';
var fs=require('fs');
var path = require('path');
const fileName = 'db2cred.json';
const userFileName = 'user.json';
var file = path.join(__dirname,fileName);
var userFile = path.join(__dirname, userFileName);
console.log(file);
var writeCred = (credList, file) => {
    fs.writeFileSync(file, JSON.stringify(credList));
}
var readCred = (file) => {
    return JSON.parse(fs.readFileSync(file));
}
var user_cred = function() {
    this.write = (credList) => writeCred(credList, file);
    this.read = () => readCred(file);
    this.readUser = () => readCred(userFile);
    this.writeUser = (credList) => writeCred(credList, userFile);
}
module.exports.users = user_cred;