'use strict';
const ibmdb = require('ibm_db');		//For connecting to DB
const Pool = require("ibm_db").Pool 	// For connection pooling
const async = require('async');

const first_names = ["Jim", "John", "Michael", "Omar", "Phyllis", "Mary", "Sheena", "Bob", "Robert", "Ignis", "Ingrid", "Amanda", "Jennifer", "Noah"]
let fnc=first_names.length;
const last_names = ["Goldberg", "Greene", "Richardson", "de Toulouse-Lautrec", "Porter", "Dormer", "Clooney", "Abeo", "Mansbridge"]
let lnc = last_names.length;
const salutations = ["Mr.", "Mrs.", "Ms.", "Sir", "Dr."]
let sc = salutations.length;

let DataLoad = function() {

    this.initPool = (cred, poolSize, prod) => {
        if(!prod) ibmdb.debug(true);
        let connStr = "DATABASE=" + cred.db + ";UID=" + cred.username + ";PWD=" + cred.password + ";HOSTNAME=" + cred.hostname + ";port=" + cred.port;
        if(this.pool){
            this.pool.cleanUp();
            this.pool.close();
        }
        this.pool = new Pool()
        this.pool.setMaxPoolSize(poolSize||1);
        this.pool.setConnectTimeout(300);
        this.pool.init(0, connStr);
        this.cred = cred;
        this.connStr = connStr;
        console.log("Initialize successfully!");
        this.connNum = 0;
        this.queryNum = 0;
    }

    this.setPoolSize = (size) => {
        if(this.pool)
            this.pool.setMaxPoolSize(parseInt(size)||1);
    }

    this.getRandomInt = (minimum, maximum)=>{
        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    }

    this.testConnection = () => {
        let sql = "select 1 from \"SYSIBM\".\"SYSTABLES\"";
        return this.testSQL(sql)
    }

    this.runSQL = (conn, sql) => {
        let result;
        this.queryNum++;
        if(typeof sql === "string"){
            try {
                result = conn.querySync(sql);
            }
            catch (error){
                console.log(error);
            }
        }
        else if(sql.query && sql.startCall && sql.successCall && sql.errorCall){
            let {query, startCall, successCall, errorCall} = sql;
            if(typeof query === "string"){
                startCall(this.connNum, this.queryNum);
                try{
                    result = conn.querySync(query);
                    successCall(this.connNum, this.queryNum - 1);
                }
                catch(error){
                    errorCall(this.connNum, this.queryNum - 1);
                }
            }
        }
        this.queryNum--;
        return result;
    }

    this.testSQL = (sql) => {
        if(typeof sql === "string") sql = [sql];
        let {pool, connStr} = this;
        let exist = 0;
        this.connNum++;
        pool.open(connStr, (err, conn) => {
           if(err){
               exist = -1; return ;
           }
           if(sql.length>0) {
               let result;
               sql.forEach((stat)=>{
                   this.runSQL(conn, stat);
               })
               conn.close();
               this.connNum--;
               //console.log(result);
               exist = 1;
           }
        });
        return exist;
    }

    this.testSQLAsync = (sql) => {
        if(typeof sql === "string") sql = [sql];
        let {pool, connStr} = this;
        this.connNum++;
        pool.open(connStr, (err, conn) => {
            let i = 0;
            async.whilst(() => i<sql.length, (next) => {
                let stat = sql[i++];
                this.runSQL(conn, stat);
                next();
            },(err)=>{
                conn.close();
                this.connNum--;
            });
        })
    }

    this.getConnNum = () => this.connNum;
    this.getQueryNum = () => this.queryNum;

    this.singleQuery = (sql) => {
        let {pool, connStr} = this, result;
        this.connNum++;
        pool.open(connStr, (err, conn) => {
            result = this.runSQL(conn, sql);
            conn.close();
            this.connNum--;
        });
        return result;
    }

    this.testTable = (tabName) => {
        let sql = "select count(*) from "+tabName;
        return this.testSQL(sql);
    }

    this.importTable = () => {
        let demo = require("./DDL").demo;
        let ddl_all = new demo().getDDL();
        let ddls = [];
        ddl_all.forEach((item)=>{
            let {tbName,ddl,privilege} = item;
            console.log(tbName);
            let fir = "DROP TABLE "+tbName;
            ddls = [...ddls,fir,ddl,...privilege];
        });
        this.testSQL(ddls);
    }

    this.getCustSQL = () => {
        let sqls = [];
        let getRandomInt = this.getRandomInt;
        for(let i=0;i<100;i++){
            let sql = "INSERT INTO \"WEBSTORE\".\"CUSTOMER\" (\"C_FIRST_NAME\",\"C_LAST_NAME\",\"C_SALUTATION\") VALUES('" + first_names[getRandomInt(0, fnc - 1)] + "' ,'" + last_names[getRandomInt(0, lnc - 1)] + "' ,'" + salutations[getRandomInt(0, sc - 1)] + "')"
            sqls.push(sql);
        }
        return sqls;
    }

    this.getInventorySQL = () => {
        let sqls = [];
        let getRandomInt = this.getRandomInt;
        for(let i=0;i<1000;i++){
            let sql = "INSERT INTO \"WEBSTORE\".\"INVENTORY\" (\"INV_QUANTITY_ON_HAND\") VALUES(" + getRandomInt(0, 1000) + ")"
            sqls.push(sql);
        }
        return sqls;
    }

    this.importData = () => {
        let sqlCust = this.getCustSQL();
        let sqlInvet = this.getInventorySQL();
        let sqls = [...sqlCust,...sqlInvet];
        this.testSQLAsync(sqls);
    }

    this.cleanData = () => {
        this.importTable();
    }

}

module.exports.dataLoad = DataLoad;