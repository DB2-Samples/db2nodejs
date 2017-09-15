'use strict';
const async = require('async');

let Pool = require('./DataLoad').dataLoad;
let Users = require('./UserLoad').userRotate;

let Output = require('./SocketOutput').output;

let ConnectionPool = function () {

    this.purchasingPool = new Pool();
    this.custServicePool = new Pool();
    this.userList = [];

    this.init = (cred, size1, size2) => {
        this.purchasingPool.initPool(cred, size1);
        this.custServicePool.initPool(cred, size2);
    }

    this.setPurSize = (size) => {
        this.purchasingPool.setPoolSize(size);
    }

    this.setCustSize = (size) => {
        this.custServicePool.setPoolSize(size);
    }

    this.setSocket = (socket, cmd, uid) => {
        this.socketOutput = new Output(socket, cmd, uid);
    }

    this.start = (cred, size1, size2, clientNum, endTime) => {
        this.init(cred, size1, size2);

        let callBackFuncs;
        if(this.socketOutput){
            callBackFuncs = this.socketOutput.generateFucs4User();
        }

        this.userList = [];
        for(let i = 0; i < clientNum; i++){
            let user = new Users();
            user.start(i, this.purchasingPool, this.custServicePool, endTime, callBackFuncs);
            this.userList.push(user);
        }
    }

    this.setEndtime = (endtime) => {
        this.userList.forEach((user)=>{
            user.autoStop(endtime);
        })
    }

    this.stop = () => {
        this.userList.forEach((user)=>{
            user.stop();
        })
    }

}

module.exports.connectionPool = ConnectionPool;