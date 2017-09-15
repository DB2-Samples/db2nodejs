'use strict';
const async = require('async');

let Pool = require('./DataLoad').dataLoad;
let Users = require('./UserLoad').userRotate;

let ConnectionPool = function () {

    this.purchasingPool = new Pool();
    this.custServicePool = new Pool();
    this.userList = [];

    this.init = (cred) => {
        this.purchasingPool.initPool(cred);
        this.custServicePool.initPool(cred);
    }

    this.setPurSize = (size) => {
        this.purchasingPool.setPoolSize(size);
    }

    this.setCustSize = (size) => {
        this.custServicePool.setPoolSize(size);
    }

    this.start = (cred, size1, size2, clientNum, endTime, callBackFuncs) => {
        this.init(cred);
        this.setPurSize(size1);
        this.setCustSize(size2);
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

}