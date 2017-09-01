'use strict';
var express = require('express');
var path = require('path');
var IO = require('socket.io');
var router = express.Router();
var demo = require("./utils/index").demo;
var product = require("./utils/index").product;
var populate = require("./utils/populate").populate;

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
var dbCredList = {};

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
        let pop;
        querys.forEach((stat) => {
            let prop = stat.split('=');
            db_oper[prop[0]] = prop[1];
        });
        if(db_oper.cmd=='test'){
            delete db_oper.cmd;
            pop = new populate(db_oper);
            if(pop.test()==1)
                res.send("{\"result\":\"success\"}");
            else res.send("{\"result\":\"fail\"}");
        }
        else if(db_oper.cmd=='load'){
            delete db_oper.cmd;
            pop = new populate(db_oper);
            if(pop.test()==1) {
                if(pop.testData()==1){
                    res.send("{\"result\":\"exist\"}");
                }
                else {
                    pop.load();
                    res.send("{\"result\":\"success\"}");
                }
            }else{
                res.send("{\"result\":\"fail\"}");
            }
        }
    }

    else {
        res.render('index_bck', {
            userID: userID
        });
    }
});

console.log(__dirname);
app.use('/', router);
server.listen(8888, function () {
    console.log('server listening on port 8888');
});
