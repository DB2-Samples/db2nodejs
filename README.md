# DB2 NodeJS Mock Webstore Sample - Requires Db2 Version 11.1.2.2

db2-node-demo is a simple implementation of an app running on Node.js runtime demonstrating how to connect Node.js applications to Db2. It includes examples of running both regular SQL statements as well as those containing JSON. The example also includes supporting dozens or hundreds of users through a set of three connection pools to Db2. 

## Installing NodeJS

If you have not already, download node.js and install it on your local machine. Use the latest LTS build from the https://nodejs.org/en/download/ website.

## Installing up the app

1. Clone the app to your local environment from your terminal using the following command:

  ```
    git clone https://github.com/DB2-Samples/db2nodejs.git
  ```

2. `cd` into this newly created directory

3. Install the required npm and bower packages using the following command

  ```
  npm install
  ```

## Setting up the database

1. `webstore.ddl` contains SQL to set up the tables required to simulate the mock webstore. You can either:
  
    a. Create a database called `WEBSTORE`, or
  
    b. Change `CONNECT TO WEBSTORE` near the top of this file to connect to a different database you wish to use
    
2. Run the SQL to create the tables. Run ```db2 -tvf webstore.ddl``` from the Db2 command line. You can also run the script using Data Server Manager. If you use DSM, make sure the SQL Editor Run Method (Edit SQL Options) is set to CLP with SSH.

3. Replace the corresponding credentials for the Db2 database you want to use in the `populate.js` file

```
        db: "WEBSTORE",
        hostname: "127.0.0.1",
        port: 50000,
        username: "DB2INST1",
        password: ""
```

4. Run ```node populate.js``` to populate the database with some randomly generated customer information and inventory.

## Setting up the app
1. Replace the corresponding credentials for your DB2 sample database in your `index.js` file

```
        db: "WEBSTORE",
        hostname: "LOCALHOST",
        port: 50000,
        username: "DB2INST1",
        password: ""
```

2. Tweak other parameters in the file as you see fit.

## Running the app

Start your app locally with the following command

  ```
  node index.js
  ```
  or
  ```
  npm start
  ```
