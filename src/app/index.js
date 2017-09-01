'use strict';
var express = require('express');
var path = require('path');
var IO = require('socket.io');
var router = express.Router();
var demo = require("./utils/index").demo;
var product = require("./utils/index").product;
var populate = require("./utils/populate").populate;
var usersCred = new require('./utils/user_cred').users;

var app = express();
var server = require('http').Server(app);
app.use(express.static(__dirname));
app.set('views', __dirname);
app.set('view engine', 'hbs');
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

// 创建socket服务
var socketIO = IO(server);
var socketList = {};
var usersCredList = new usersCred();
var dbCredList = usersCredList.read();

socketIO.on('connection', function (socket) {
    // 获取请求建立socket连接的url
    // 如: http://localhost:3000/room/room_1, roomID为room_1
    var url = socket.request.headers.referer;
    console.log(socket.request.headers.referer);
    var splited = url.split('/');
    var userID = splited[splited.length - 1];

    socket.on('start', function (params) {

        socket.join(userID);    // 加入房间
        // 通知房间内人员
        var num = parseInt(params.num);
        delete params.num;
        var cred = params;
        dbCredList[userID] = cred;
        usersCredList.write(dbCredList);

        console.log(userID + '加入了');
        var db_cre = new populate(cred);
        if(db_cre.test()==1) {
            if(db_cre.testData()==1) {
                if (!socketList[userID]) socketList[userID] = new product(num, socketIO, userID, 'msg');
                socketList[userID].start();
            }
            else socketIO.to(userID).emit('sys', 'nodata');
        }
        else{
            socketIO.to(userID).emit('sys', 'nocred');
        }
    });

    socket.on('stop', function () {
        if(socketList[userID]) {
            socketList[userID].stop();
            delete socketList[userID];
        }
    });

    socket.on('disconnect', function (userName) {

        if(socketList[userID]) {
            socketList[userID].stop();
            delete socketList[userID];
        }
        socket.leave(userID);
        // 通知房间内人员
        socketIO.to(userID).emit('sys', userID + '退出了房间');
        console.log(userID + '加入了');
    });

    // 接收用户消息,发送相应的房间
    socket.on('message', function (msg) {
    });

});
router.get('/:userID', function (req, res) {
    var userID = req.params.userID;
    console.log(userID);

    if(userID=="submit_Form"){
        var user = req.query.username;
        res.render('index_bck', {
            userID: user
        });
    }
    // 渲染页面数据(见views/room.hbs)
    else if(userID=='upload'){
        var querys = req._parsedOriginalUrl.query.split("&");
        let db_oper = {};
        querys.forEach((stat) => {
            let prop = stat.split('=');
            db_oper[prop[0]] = prop[1];
        });
        let pop;
        let userid = db_oper.userid;
        delete db_oper.userid;
        if(db_oper.cmd=='test'){
            let result = {
                severity: "error",
                title: "FAILED!",
                body: "Failed to connect to the database."
            }
            delete db_oper.cmd;
            console.log(db_oper);
            dbCredList[userid] = db_oper;
            usersCredList.write(dbCredList);
            if(!pop) pop = new populate(db_oper);
            if(pop.test()==1) {
                result = {
                    severity: "success",
                    title: "SUCCESS!",
                    body: "Successfully connect to the database."
                }
            }
            res.send(JSON.stringify(result));
        }
        else if(db_oper.cmd=='load'){
            let result = {
                severity: "error",
                title: "FAILED!",
                body: "Failed to load the mock data."
            }
            delete db_oper.cmd;
            dbCredList[userid] = db_oper;
            usersCredList.write(dbCredList);
            if(!pop) pop = new populate(db_oper);
            if(pop.test()==1) {
                if(pop.testData()==1){
                    result = {
                        severity: "info",
                        title: "ALREADY EXISTS!",
                        body: "There's already mock data in the certain db table."
                    }
                }
                else {
                    pop.load();
                    result = {
                        severity: "success",
                        title: "SUCCESS!",
                        body: "Successfully load the mock data."
                    }
                }
            }
            res.send(JSON.stringify(result));
        }
        else if(db_oper.cmd=='clear'){
            let result = {
                severity: "error",
                title: "FAILED!",
                body: "Failed to clear the table data."
            };
            delete db_oper.cmd;
            dbCredList[userid] = db_oper;
            usersCredList.write(dbCredList);
            if(!pop) pop = new populate(db_oper);
            if(pop.test()==1) {
                if(pop.delete()==1){
                    result = {
                        severity: "success",
                        title: "SUCCESS!",
                        body: "Successfully clear the table data."
                    }
                }
            }
            res.send(JSON.stringify(result));
        }
    }

    else {
        let cred = {hostname:"", port:"", db:"", username:"", password:""};
        if(dbCredList[userID]) cred = dbCredList[userID]
        let {hostname, port, db, username, password} = cred;
        res.render('index_bck', {
            userID: userID,
            hostname, port, db, username, password
        });
    }
});

console.log(__dirname);
app.use('/', router);
server.listen(8888, function () {
    console.log('server listening on port 8888');
});
