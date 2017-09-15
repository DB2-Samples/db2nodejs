var db_cred = {
        "db": "wangyu",
        "hostname": "9.30.147.53",
        "port": 50000,
        "username": "db2inst1",
        "password": "n1cetest"
    };

var dataLoad = require("../src/app/utils/DataLoad").dataLoad;
var dbConn = new dataLoad(db_cred);
dbConn.initPool(db_cred);
dbConn.importData();
