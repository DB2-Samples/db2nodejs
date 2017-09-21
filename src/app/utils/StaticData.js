'use strict';

//UserLoad

let minTime = 1000;	// Minimum amount of time between customer actions
let maxTime = 3000;

let userLoadSocketOutput = {
    login:["querying user table-start", "signs in-success", "fails to sign in-error"],
    browse:["starts browsing(select)-process", "is browsing(select)-success", "is browsing(select)-error"],
    buy:["starts buying(insert) table-process", "is buying(insert)-success", "is buying(insert)-error"],
    alterorder:["starts checking(select)-process-1-2", "is checking(select)-success-2", "is checking(select)-error-2"],
    updateorder:["starts updating(update)-process-2", "is updating(update)-success-2", "is updating(update)-error-2"],
    deleteorder:["starts deleting(delete)-process-2", "is deleting(delete)-success-2", "is deleting(delete)-error-2"],
    jsonstuff:["starts json func(insert)-process", "completes json func(insert)-success", "completes json func(insert)-error"]
}

let staticData = function() {
}


staticData.prototype.getMinTime = () => minTime;

staticData.prototype.getMaxTime = () => maxTime;

staticData.prototype.setMaxTime = (time) => maxTime = time;

staticData.prototype.setMinTime = (time) => minTime = time;

staticData.prototype.getUserLoadSocketOutput = () => userLoadSocketOutput;

module.exports.staticData = staticData;

//SocketData
