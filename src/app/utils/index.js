
function Demo(num, socket, id, cmd, stop, cred) {
    var ibmdb = require('ibm_db');		//For connecting to DB
    var Pool = require("ibm_db").Pool 	// For connection pooling
    var async = require('async');       // For executing loops asynchronously

//************//
// PARAMETERS //
//************//

//////////////////////////////////////////
// Enter your database credentials here //
//////////////////////////////////////////
    var db_cred = cred||{
        "db": "WEBSTORE",
        "hostname": "9.30.147.53",
        "port": 50000,
        "username": "db2inst1",
        "password": "n1cetest"
    };

///////////////////////
// Overall Behaviour //
///////////////////////
    console.log(num+" clients");
    var numClients = parseInt(num)||4; 	// Number of simulated clients

    var minTimeout = 1000;	// Minimum amount of time between customer actions
    var maxTimeout = 10000; // Maximum amount of time between customer actions

    var purchasingWeight = 4;		// Purchasing demonstrates SELECTS and INSERTS
    var customerServiceWeight = 2;  // Customer service demonstrates UPDATES and DELETES
    var jsonWeight = 1;				// Weight on client testing JSON capabilities

    var maxRunTime = 0; // Time before this application quits (minutes). Set to 0 to run indefinitely

////////////////////////////////
// Connection pool parameters //
////////////////////////////////
    var purchasingInitConnections = 2; // Number of connections to initialize in the pool upon launch
    var purchasingMaxConnections = 5; // Max number of connections the pool can open

    var customerServiceInitConnections = 1; // Number of connections to initialize in the pool upon launch
    var customerServiceMaxConnections = 1; // Max number of connections the pool can open

    var connTimeout = 60; // No of seconds pool.open() will wait for a connection to be available

//////////////////////////
// Purchasing behaviour //
//////////////////////////
    var minBrowses = 1;		// Minimum number of pages a customer will browse
    var maxBrowses = 2;	// Maximum number of pages a customer will browse
    var buyingPercent = 30; // Percent chance that customer will place an order for a random item on the current page

////////////////////////////////
// Customer service behaviour //
////////////////////////////////
    var updateWeight = 4; // Weight on customer updating their order
    var deleteWeight = 1; // Weight on customer cancelling their order


//*******//
// SETUP //
//*******//
// Turn database credentials into a connection string
    var connString = "DATABASE=" + db_cred.db + ";UID=" + db_cred.username + ";PWD=" + db_cred.password + ";HOSTNAME=" + db_cred.hostname + ";port=" + db_cred.port;

// Function for generating random integer between a given minimum and maximum value
    function getRandomInt(minimum, maximum) {
        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    }
    socket.to(id).emit(cmd, new Date());
    end_time = new Date().valueOf() + maxRunTime * 60000 // This is the time we want the app to stop running at

    ibmdb.debug(true); // Turning debug on allows us to see what queries are run via the console

// Setup connection pool used for making purchases
    purchasingPool = new Pool()
    purchasingPool.setMaxPoolSize(purchasingMaxConnections);
    purchasingPool.setConnectTimeout(connTimeout);
    purchasingPool.init(purchasingInitConnections, connString)

// Setup connection pool used for customer service
    customerServicePool = new Pool()
    customerServicePool.setMaxPoolSize(customerServiceMaxConnections);
    customerServicePool.setConnectTimeout(connTimeout);
    customerServicePool.init(customerServiceInitConnections, connString)

    var sumWeight = updateWeight + deleteWeight;
    var sumPoolUsageWeights = purchasingWeight + customerServiceWeight + jsonWeight


//***********//
// EXECUTION //
//***********//


    for (var j = 1; j <= numClients; j++) {	// Each iteration of the for loop starts at the same time, simulating simultaneous clients
        const k = j;
        async.whilst(() => {
            return stop();
        }, (next_run) => { // Loop so when this simulated client ends, a new one starts
            if (new Date().valueOf() >= end_time && maxRunTime != 0) {
                socket.to(id).emit(cmd, new Date());
                process.exit()
            } // Check if it's time to kill the app
            var k = getRandomInt(1, numClients);
            socket.to(id).emit(cmd, j, 'OPEN', 'OPEN');
            setTimeout(() => { // Add delay so not all users connect at the same time
                new Promise((resolve, reject) => {
                    // Simulate the user logging in
                    customerServicePool.open(connString, (err, conn) => {
                        if (err) {
                            console.log(err);
                            socket.to(id).emit(cmd, err);
                            return;
                        }
                        //Get user info:
                        var sql = "select * from WEBSTORE.CUSTOMER order by RAND() fetch first 1 rows only"
                        var user = conn.querySync(sql)[0];
                        let UserName = user.C_SALUTATION + user.C_LAST_NAME;
                        socket.to(id).emit(cmd, k, UserName, "signes in");
                        conn.close();
                        resolve(user);
                    });
                }).then((user) => { // Now we have the user info
                    choiceOfAction = getRandomInt(1, sumPoolUsageWeights) //we randomly decide their behaviour based on weights
                    let UserName = user.C_SALUTATION + user.C_LAST_NAME;
                    if (choiceOfAction <= purchasingWeight) { // In this case, the customer has logged in to make a purchase
                        socket.to(id).emit(cmd, k, UserName, 'starts purchasing');
                        //Simulate browsing
                        var browses = getRandomInt(minBrowses, maxBrowses); // Random number of pages to browse

                        var i = 0; // Counter for following loop
                        async.whilst(() => { // Loop for page browses
                            return i < browses;
                        }, (next) => {

                            var waitTime = getRandomInt(minTimeout, maxTimeout); // Wait time used to create lag between page browses

                            socket.to(id).emit(cmd, k, UserName, 'is waiting for ' + waitTime + ' ms to browse');
                            setTimeout(() => {
                                new Promise((resolve2, reject2) => {
                                    purchasingPool.open(connString, (err, conn) => { // Open a connection in the purchasingPool
                                        // Here we get the page by randomly selecting 9 items
                                        var sql1 = "select * from WEBSTORE.INVENTORY where INV_QUANTITY_ON_HAND > 0 order by RAND() fetch first 9 rows only"
                                        var rows = conn.querySync(sql1);
                                        socket.to(id).emit(cmd, k, UserName, 'starts to browse');
                                        conn.close()
                                        resolve2(rows)
                                    })

                                }).then((rows) => {
                                    //Now that we have the rows, we randomly decide (based on buyingPercent) if the customer will order an item on this page
                                    if (getRandomInt(0, 100) <= buyingPercent) {

                                        purchasingPool.open(connString, (err, conn) => {
                                            socket.to(id).emit(cmd, k, UserName, 'is buying an item');
                                            item = rows[getRandomInt(0, 8)] // Randomly select one of the items on this page
                                            sql2 = 'INSERT INTO "WEBSTORE"."WEBSALES" ("WS_CUSTOMER_SK","WS_ITEM_SK","WS_QUANTITY") VALUES(' + user.C_CUSTOMER_SK + ', ' + item.INV_ITEM_SK + ', ' + getRandomInt(1, item.INV_QUANTITY_ON_HAND) + ');'
                                            conn.querySync(sql2);
                                            conn.close();
                                            i++;
                                            next()
                                        })

                                    } else { // If no purchasing, just move onto next page browse
                                        i++; // Increment browsing counter
                                        next(); // Go to next browse
                                    }

                                })

                            }, waitTime); // This is a time delay on customer starting browsing to next page

                        }, () => {
                            socket.to(id).emit(cmd, k, UserName, 'signs out');
                            next_run();
                        }) // Done browsing. End this client and start a new one

                    }
                    else if (choiceOfAction <= purchasingWeight + customerServiceWeight) { // In this case, the customer has logged in to alter/cancel their order
                        socket.to(id).emit(cmd, k, UserName, 'is here to update his order');
                        setTimeout(() => {
                            // In this case we want to use the customer service connection pool
                            customerServicePool.open(connString, (err, conn) => {
                                if (err) {
                                    console.log(err);
                                    socket.to(id).emit(cmd, err);
                                    return;
                                }

                                // Randomly select an order belonging to this customer
                                sql = "select * from WEBSTORE.WEBSALES where WS_CUSTOMER_SK = " + user.C_CUSTOMER_SK + " order by RAND() fetch first 1 rows only"
                                var order = conn.querySync(sql)[0];

                                // Put this in a try-catch just in case this customer has no orders
                                try {
                                    // In this case the customer is altering their order
                                    if (getRandomInt(1, sumWeight) <= updateWeight) {
                                        sql = "UPDATE WEBSTORE.WEBSALES SET WS_QUANTITY = " + getRandomInt(1, 20) + " WHERE WS_CUSTOMER_SK = " + user.C_CUSTOMER_SK + " AND WS_ORDER_NUMBER = " + order.WS_ORDER_NUMBER + " AND WS_ITEM_SK = " + order.WS_ITEM_SK
                                        conn.querySync(sql);
                                        socket.to(id).emit(cmd, k, UserName, 'alters his order.');
                                        socket.to(id).emit(cmd, k, UserName, 'signs out');
                                    }
                                    else { // In this case, the customer is cancelling their order
                                        sql = "DELETE FROM WEBSTORE.WEBSALES WHERE WS_CUSTOMER_SK = " + user.C_CUSTOMER_SK + " AND WS_ORDER_NUMBER = " + order.WS_ORDER_NUMBER + " AND WS_ITEM_SK = " + order.WS_ITEM_SK
                                        conn.querySync(sql);
                                        socket.to(id).emit(cmd, k, UserName, 'cancels his order.');
                                        socket.to(id).emit(cmd, k, UserName, 'signs out');
                                    }

                                }
                                catch (err) { // Alert if there are no orders for this customer
                                    console.log(err);
                                    socket.to(id).emit(cmd, k, UserName, 'didn\' make an order.');
                                    socket.to(id).emit(cmd, k, UserName, 'signs out');
                                    console.log('SILLY ' + user.C_FIRST_NAME + user.C_LAST_NAME + 'HAS NO ORDERS TO UPDATE!!');
                                    conn.close();
                                }
                                conn.close();
                                next_run(); // Done altering order. End this client and start a new one
                            });
                        }, getRandomInt(minTimeout, maxTimeout)) // Random timeout on order altering
                    }
                    else { // JSON stuff
                        console.log("LET'S TEST OUT JSON FUNCTIONALITY!");
                        console.log("HERE IS A JSON WE WANT TO INSERT");
                        console.log(user)	// Let's insert the user info
                        purchasingPool.open(connString, (err, conn) => {
                            // Insert a JSON to the table using JSON2BSON
                            sql = "INSERT INTO  \"WEBSTORE\".\"TESTJSON\" (\"JSON_FIELD\") VALUES(SYSTOOLS.JSON2BSON('" + JSON.stringify(user) + "'))" // It needs to be converted to a string before put in the sql
                            conn.querySync(sql);
                            console.log(".\n.\n")
                            console.log("NOW LET'S RETRIEVE A JSON FROM THE TABLE")
                            sql = "SELECT SYSTOOLS.BSON2JSON(JSON_FIELD) FROM WEBSTORE.TESTJSON order by rand() fetch first 1 rows only"
                            result = conn.querySync(sql)
                            console.log(result[0]['1']) // For some reason the JSON is returned inside another JSON with one element labeled '1'

                            conn.close()
                            next_run(); //Done demoing JSON.
                        })

                    }

                })

            }, getRandomInt(minTimeout, maxTimeout))

        }, (err)=>{
            console.log("stop this retailer");
            closeRetailer(k);
        })
    }

    var closeNum = [];
    var totalCount = 1;
    var closeRetailer = function(k){
        let index = closeNum.findIndex((num)=>num==k);
        if(totalCount++==numClients){
            for(let i=1;i<=numClients;i++){
                socket.to(id).emit(cmd, i, 'CLOSE', 'CLOSE');
            }
        }
        if(index==-1) {
            socket.to(id).emit(cmd, k, 'CLOSE', 'CLOSE');
            closeNum.push(k);
        }
        else{
            for(let i = 1;i<=numClients;i++){
                let ind = closeNum.findIndex((num)=>num==i);
                if(ind==-1){
                    socket.to(id).emit(cmd, i, 'CLOSE', 'CLOSE');
                    return ;
                }
            }
        }
    }
}
function product(num, socket, id, cmd, cred) {
    this.num = num;
    this.socket = socket;
    this.id = id;
    this.cmd = cmd;
    this.cred = cred;
    this.isNotStop = true;
    this.start = ()=>{Demo(this.num, this.socket, this.id, this.cmd, this.getStop, this.cred);}
    this.stop = () => {console.log("stop this");this.isNotStop = false};
    this.getStop = ()=>this.isNotStop;
}
module.exports.demo = Demo;
module.exports.product = product;