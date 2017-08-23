'use strict';
var express = require('express');
var path = require('path');
var IO = require('socket.io');
var router = express.Router();
var demo = require("./utils/index").demo;

var app = express();
var server = require('http').Server(app);
app.use(express.static(__dirname));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

// 创建socket服务
var socketIO = IO(server);


socketIO.on('connection', function (socket) {
    // 获取请求建立socket连接的url
    // 如: http://localhost:3000/room/room_1, roomID为room_1
    var url = socket.request.headers.referer;
    console.log(socket.request.headers.referer);

    socket.on('start', function (userName) {

        socket.join(userName);    // 加入房间
        // 通知房间内人员
        socketIO.to(userName).emit('sys', userName + '加入了房间');
        console.log(userName + '加入了');
        demo(4, socketIO, userName, 'msg');
    });

    // 接收用户消息,发送相应的房间
    socket.on('message', function (msg) {
    });

});
router.get('/:roomID', function (req, res) {
    var roomID = req.params.roomID;

    // 渲染页面数据(见views/room.hbs)
    res.render('room', {
        roomID: "hahaha",
        users: "gagaga"
    });
});
console.log(__dirname);
app.use('/', router);
server.listen(8888, function () {
    console.log('server listening on port 8888');
});
