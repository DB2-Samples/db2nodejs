// This small app will populate the mock webstore database with
// randomly generated customers and inventory.
//
// PREREQUISITE:
// 	- Run the SQL in webstore.ddl to create the tables this app will populate
'use strict';
var ibmdb = require('ibm_db');		//For connecting to DB
var Pool = require("ibm_db").Pool 	// For connection pooling
var async = require('async');       // For executing loops asynchronously

//************//
// PARAMETERS //
//************//
let db_cred = {
    db: "WEBSTORE",
    hostname: "9.30.147.53",
    port: 50000,
    username: "db2inst1",
    password: "n1cetest"
};
//select name from tabl1 where id = 2
//////////////////////////////////////////
// Enter your database credentials here //
//////////////////////////////////////////
//var db_cred = require('../../config/db2.json');

// Turn database credentials into a connection string
//var connString = "DATABASE=" + db_cred.db + ";UID=" + db_cred.username + ";PWD=" + db_cred.password + ";HOSTNAME=" + db_cred.hostname + ";port=" + db_cred.port;

// Function for generating random integer between a given minimum and maximum value
function getRandomInt(minimum, maximum){
	return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}
 // Turning debug on allows us to see what queries are run via the console


let first_names = ["Jim", "John", "Michael", "Omar", "Phyllis", "Mary", "Sheena", "Bob", "Robert", "Ignis", "Ingrid", "Amanda", "Jennifer", "Noah"]
let fnc=first_names.length;
let last_names = ["Goldberg", "Greene", "Richardson", "de Toulouse-Lautrec", "Porter", "Dormer", "Clooney", "Abeo", "Mansbridge"]
let lnc = last_names.length;
let salutations = ["Mr.", "Mrs.", "Ms.", "Sir", "Dr."]
let sc = salutations.length;

// Setup connection pool used for making purchases
var loadData = (pool, cred, callback) => {
	var i = 0;
	var connString = "DATABASE=" + cred.db + ";UID=" + cred.username + ";PWD=" + cred.password + ";HOSTNAME=" + cred.hostname + ";port=" + cred.port;
	pool.open(connString, (err, conn) => {
		if (err) {
			console.log(err);
			return;
		}
		//Get user info:
		var sql = "DELETE FROM \"WEBSTORE\".\"CUSTOMER\"";
		conn.querySync(sql);
		conn.close();
		console.log("CLEAN CUSTOMERS");
	});
	pool.open(connString, (err, conn) => {
		if (err) {
			console.log(err);
			return;
		}
		//Get user info:
		var sql = "DELETE FROM \"WEBSTORE\".\"INVENTORY\"";
		conn.querySync(sql);
		conn.close();
		console.log("CLEAN INVENTORY");
	});
	async.whilst(() => {
		return i < 100
	}, (next) => {
		pool.open(connString, (err, conn) => {
			if (err) {
				console.log(err);
				return;
			}
			//Get user info:
			var sql = "INSERT INTO \"WEBSTORE\".\"CUSTOMER\" (\"C_FIRST_NAME\",\"C_LAST_NAME\",\"C_SALUTATION\") VALUES('" + first_names[getRandomInt(0, fnc - 1)] + "' ,'" + last_names[getRandomInt(0, lnc - 1)] + "' ,'" + salutations[getRandomInt(0, sc - 1)] + "')"
			conn.querySync(sql);
			conn.close();
			i++;
			console.log("CREATED " + i + " CUSTOMERS")
			next()
		});

	}, (err)=>{
		if(callback)
			callback();
	});


	i = 0
	async.whilst(() => {
		return i < 1000
	}, (next) => {
		pool.open(connString, (err, conn) => {
			if (err) {
				console.log(err);
				return;
			}
			//Get user info:
			var sql = "INSERT INTO \"WEBSTORE\".\"INVENTORY\" (\"INV_QUANTITY_ON_HAND\") VALUES(" + getRandomInt(0, 1000) + ")"
			conn.querySync(sql, []);
			conn.close();
			i++;
			console.log("CREATED " + i + " ITEMS")
			next()
		});

	}, (err)=>{
		if(callback) callback();
	});
}

var Initialize = (cred) => {
	ibmdb.debug(true);
	var connStr = "DATABASE=" + cred.db + ";UID=" + cred.username + ";PWD=" + cred.password + ";HOSTNAME=" + cred.hostname + ";port=" + cred.port;
	var pool = new Pool()
	pool.setMaxPoolSize(1);
	pool.setConnectTimeout(60);
	pool.init(1, connStr);
	console.log("Initialize successfully!");
	return pool;
}

var testDataExist = (pool, cred)=>{
	let exist = 0;
	var connStr = "DATABASE=" + cred.db + ";UID=" + cred.username + ";PWD=" + cred.password + ";HOSTNAME=" + cred.hostname + ";port=" + cred.port;
	pool.open(connStr, (err, conn) => {
		if (err)
		{
			console.log("fail to connect to DB");
			exist = -1;
			return;
		}
		//Get user num:
		var sql = "select 1 from \"SYSIBM\".\"SYSTABLES\"";
		var num = conn.querySync(sql);
		conn.close();
		exist = 1;
	});
	return exist;
}

var testData = (pool, cred) => {
	let exist = 0;
	var connStr = "DATABASE=" + cred.db + ";UID=" + cred.username + ";PWD=" + cred.password + ";HOSTNAME=" + cred.hostname + ";port=" + cred.port;
	pool.open(connStr, (err, conn) => {
		if (err)
		{
			console.log("fail to connect to DB");
			exist = -1;
			return;
		}
		//Get user num:
		var sql = "select count(*) from \"WEBSTORE\".\"CUSTOMER\"";
		var num = conn.querySync(sql)[0]['1'];
		console.log(num);
		sql = "select count(*) from \"WEBSTORE\".\"INVENTORY\"";
		var num2 = conn.querySync(sql)[0]['1'];
		console.log(num2);
		conn.close();
		if(parseInt(num)>=0&&parseInt(num2)>0) exist = 1;
	});
	return exist;
}

function populate(cred, callBack) {
	this.cred = cred;
	this.pool = Initialize(cred);
	this.test = () => testDataExist(this.pool, this.cred);
	this.testData = () => testData(this.pool, this.cred);
	this.load = () => loadData(this.pool, this.cred, this.callBack);
	this.callBack = callBack;
}

// var p = new populate(db_cred);
// console.log(p.test());
// p.load();

module.exports.populate = populate;