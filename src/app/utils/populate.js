// This small app will populate the mock webstore database with
// randomly generated customers and inventory.
//
// PREREQUISITE: 
// 	- Run the SQL in webstore.ddl to create the tables this app will populate

var ibmdb = require('ibm_db');		//For connecting to DB
var Pool = require("ibm_db").Pool 	// For connection pooling
var async = require('async');       // For executing loops asynchronously

//************//
// PARAMETERS //
//************//

//////////////////////////////////////////
// Enter your database credentials here //
//////////////////////////////////////////
var db_cred = require('../../config/db2.json');

// Turn database credentials into a connection string
var connString = "DATABASE=" + db_cred.db + ";UID=" + db_cred.username + ";PWD=" + db_cred.password + ";HOSTNAME=" + db_cred.hostname + ";port=" + db_cred.port;

// Function for generating random integer between a given minimum and maximum value
function getRandomInt(minimum, maximum){
	return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

ibmdb.debug(true); // Turning debug on allows us to see what queries are run via the console


first_names = ["Jim", "John", "Michael", "Omar", "Phyllis", "Mary", "Sheena", "Bob", "Robert", "Ignis", "Ingrid", "Amanda", "Jennifer", "Noah"]
fnc=first_names.length
last_names = ["Goldberg", "Greene", "Richardson", "de Toulouse-Lautrec", "Porter", "Dormer", "Clooney", "Abeo", "Mansbridge"]
lnc = last_names.length
salutations = ["Mr.", "Mrs.", "Ms.", "Sir", "Dr."]
sc = salutations.length

// Setup connection pool used for making purchases
pool = new Pool()
pool.setMaxPoolSize(1);
pool.setConnectTimeout(60);
pool.init(1, connString)

i = 0
async.whilst( () => { return i < 100 }, (next) =>{
	pool.open(connString, (err, conn) => {
		if (err) 
	    {
	      console.log(err);
	      return;
	    }
	    //Get user info:
	    var sql = "INSERT INTO \"WEBSTORE\".\"CUSTOMER\" (\"C_FIRST_NAME\",\"C_LAST_NAME\",\"C_SALUTATION\") VALUES('" + first_names[getRandomInt(0,fnc-1)] + "' ,'" + last_names[getRandomInt(0,lnc-1)] + "' ,'" + salutations[getRandomInt(0,sc-1)] + "')"
	    conn.querySync(sql);
	    conn.close();
	    i++;
	    console.log("CREATED " + i + " CUSTOMERS")
	    next()
	});

})


i = 0
async.whilst( () => { return i < 1000 }, (next) =>{
	pool.open(connString, (err, conn) => {
		if (err) 
	    {
	      console.log(err);
	      return;
	    }
	    //Get user info:
	    var sql = "INSERT INTO \"WEBSTORE\".\"INVENTORY\" (\"INV_QUANTITY_ON_HAND\") VALUES("+ getRandomInt(0,1000)+")"
	    conn.querySync(sql, []);
	    conn.close();
	    i++;
	    console.log("CREATED " + i + " ITEMS")
	    next()
	});

})
