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


//GET home page.
// router.get('/',function (req,res){
//     console.log(req.params.password);
//     if(req.params.password!=''){
//     res.json({password:123456});
//   }
// });



// 创建socket服务
var socketIO = IO(server);
var socketList = {};
var userNum = {};
var usersCredList = new usersCred();
var dbCredList = usersCredList.read();

var userAuth = {};
const usrPwd = {
  "larry":"passw0rd"
}

socketIO.on('connection', function (socket) {
    // 获取请求建立socket连接的url
    // 如: http://localhost:3000/room/room_1, roomID为room_1
    var url = socket.request.headers.referer;
    console.log(socket.request.headers.referer);
    var splited = url.split('/');
    var userID = splited[splited.length - 1];
    if(!userNum[userID]) userNum[userID] = 1;
    else userNum[userID]++;

    userAuth[userID]++;

    var newUserID = userID + userNum[userID];
    console.log(newUserID);

    socket.on('start', function (params) {

        socket.join(newUserID);    // 加入房间
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
                if (!socketList[newUserID]) {
                    socketList[newUserID] = new product(num, socketIO, newUserID, 'msg');
                }
                socketList[newUserID].start();
            }
            else socketIO.to(newUserID).emit('sys', 'nodata');
        }
        else{
            socketIO.to(newUserID).emit('sys', 'nocred');
        }
    });

    socket.on('stop', function () {
        if(socketList[newUserID]) {
            socketList[newUserID].stop();
            delete socketList[newUserID];
        }
    });

    socket.on('disconnect', function (userName) {

        if(socketList[newUserID]) {
            socketList[newUserID].stop();
            delete socketList[newUserID];
        }
        userAuth[userID]--;
        if(userAuth[userID]==1) {
            delete userAuth[userID];
        }
        socket.leave(newUserID);

        // 通知房间内人员
        socketIO.to(newUserID).emit('sys', userID + '退出了房间');
        console.log(userID + '加入了退出了房间');
    });

    // 接收用户消息,发送相应的房间
    socket.on('message', function (msg) {
    });

});
router.get('/:userID/:path', function(req, res){
    var user = req.params.userID;
    var path = req.params.path;
    if(userAuth[user]>0){
        if(path == 'upload'){
            var querys = req._parsedOriginalUrl.query.split("&");
            let db_oper = {};
            querys.forEach((stat) => {
                let prop = stat.split('=');
                db_oper[prop[0]] = prop[1];
            });
            let pop;
            let userid = db_oper.userid;
            delete db_oper.userid;
            if (db_oper.cmd == 'test') {
                let result = {
                    severity: "error",
                    title: "FAILED!",
                    body: "Failed to connect to the database."
                }
                delete db_oper.cmd;
                console.log(db_oper);
                dbCredList[userid] = db_oper;
                usersCredList.write(dbCredList);
                if (!pop) pop = new populate(db_oper);
                if (pop.test() == 1) {
                    result = {
                        severity: "success",
                        title: "SUCCESS!",
                        body: "Successfully connect to the database."
                    }
                }
                res.send(JSON.stringify(result));
            }
            else if (db_oper.cmd == 'load') {
                let result = {
                    severity: "error",
                    title: "FAILED!",
                    body: "Failed to load the mock data."
                }
                delete db_oper.cmd;
                dbCredList[userid] = db_oper;
                usersCredList.write(dbCredList);
                if (!pop) pop = new populate(db_oper);
                if (pop.test() == 1) {
                    if (pop.testData() == 1) {
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
            else if (db_oper.cmd == 'clear') {
                let result = {
                    severity: "error",
                    title: "FAILED!",
                    body: "Failed to clear the table data."
                };
                delete db_oper.cmd;
                dbCredList[userid] = db_oper;
                usersCredList.write(dbCredList);
                if (!pop) pop = new populate(db_oper);
                if (pop.test() == 1) {
                    if (pop.delete() == 1) {
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
    }
    else {
        res.location('index.html');
        res.send(302);
    }
});
router.get('/:userID', function (req, res) {
    var userID = req.params.userID;
    if(userAuth[userID]>0) {
        let cred = {hostname: "", port: "", db: "", username: "", password: ""};
        if (dbCredList[userID]) cred = dbCredList[userID]
        let hostname = cred.hostname, port = cred.port, db = cred.db, username = cred.username, password = cred.password;
        res.render('index_bck', {
            userID: userID,
            hostname, port, db, username, password
        });
    }
    else{
        if(userID=='login'){
          var querys = req._parsedOriginalUrl.query.split("&");
          let params = {};
          querys.forEach((item)=>{
              params[item.split('=')[0]] = item.split('=')[1];
          });
          if(usrPwd[params.username] && usrPwd[params.username]==params.password){
              if(!userAuth[params.username])userAuth[params.username] = 1;
              res.send("{\"result\":\"success\",\"user\":\""+params.username+"\"}");
          }
          else{
            res.end("{\"result\":\"unknown user\"}");
          }
          console.log(req._parsedOriginalUrl.query);
      }
      else{
        res.location('index.html');
        res.send(302);
      }
    }
});

console.log(__dirname);
app.use('/', router);
server.listen(8888, function () {
    console.log('server listening on port 8888');
  //  console.log("information: "+str.toString());
});
