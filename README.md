# DB2 NodeJS Mock Webstore Sample

db2-node-demo is a simple implementation of an app running on Node.js runtime demonstrating how to connect Node.js applications to DB2.

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
    
2. Run the SQL to create the tables. You can copy-paste the contents of `webstore.ddl` into RunSQL in DSM or run ```db2 -tvf webstore.ddl``` from the terminal

3. Replace the corresponding credentials for your DB2 sample database in your `populate.js` file

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
        db: "SAMPLE",
        hostname: "LOCALHOST",
        port: 50000,
        username: "DB2INST1",
        password: ""
```

2. Tweak other parameters in the file as you see fit

## Running the app

Start your app locally with the following command

  ```
  node index.js
  ```
  or
  ```
  npm start
  ```
