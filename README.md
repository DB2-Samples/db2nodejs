                     Overview of DB2 NodeJS Mock Webstore
        IBM® DB2 NodeJS Mock Webstroe is an webstroe management tools plantform.It is simple
     to set up ,easy to use,and capable of managing databases.

    With DB2 NodeJS Mock Webstore,people can register and login to connection DB2 to start
 the webstroe.

    DB2 NodeJS Mock Webstore provides:

     1.Sign In/Sign Up interface

     a.'Sign In'.There is a file to storage the exisiting 'User name' and 'Password' named
 user.json that located in './src/app/config'.If no 'User name' and 'Password' are available,
 you can sign up can login the webstore.

     b.'Sign Up'.You can Sign Up the 'User name' with a combination of lowercase letters.And
 if you input the existing 'User Name',there will alert 'sign up failed:existed user'.What's
 more,import a valid 'User Name','Password',and 'Comfirm password' then click on the button
 'Sign Up' to the webstore page.

    2.Db2 Credential

    This section includes five items that needed to be filed in:

     a.'IP Address/Domain'
        please enter:'9.30.147.53'

     b.'Port'
        please enter:'50000'

     c.'Database name'
        please enter:'WEBSTORE'

     d.'Db2 User'
        please enter:'db2inst1'

     e.'Password'
        please enter:'n1cetest'

    Later,click on the 'Test connection' button to connect to the database.You can use 'Load data'
to load the mock data to the certain db table(TESTJSON,WEBSALES,INVENTORY,CUSTOMER).Besides,you can use 'Clear data' to clean the
certain db table's data.

    3.App Control Panel

    This section includes three items that needed to be filed in:

        a.'Limit for Purchasing pool'

            The number will be shown in the right as cubes,if you import 3 that means 3 'Purchasing Pool' to connect with those tables((TESTJSON,WEBSALES,INVENTORY,CUSTOMER))
     And it will show the 'user signs in','user selects','user inserts'.
     
        b.'Limit for customer service pool'  
             The number will be shown in the right as cubes,if you import 2 that means 2 'Customer Service Pool' to connect with those tables((TESTJSON,WEBSALES))
                  And it will show the 'user checks','user deletes'.
                  
        c.'Parrallel user number'
        
            The number should be controlled in 40,if this number is exceeded,the system may crash.





























































# DB2 NodeJS Mock Webstore Sample - Requires Db2 Version 11.1.2.2

db2-node-demo is a simple implementation of an app running on Node.js runtime
demonstrating how to connect Node.js applications to Db2. It includes examples of
running both regular SQL statements as well as those containing JSON. The example
also includes supporting dozens or hundreds of users through a set of three 
connection pools to Db2.

## Installing NodeJS

If you have not already, download node.js and install it on your local machine.
Use the latest LTS build from the https://nodejs.org/en/download/ website.

## Installing up the app

1. Clone the app to your local environment from your terminal using the following
 command:

  ```
    git clone https://github.com:LarryKX/db2nodejs.git
  ```

2. `cd` into this newly created directory

3. Install the required npm and bower packages using the following command

  ```
  npm install
  ```

## Setting up the database

1. `webstore.ddl` contains SQL to set up the tables required to simulate the mock
webstore. You can either:
  
    a. Create a database called `WEBSTORE`, or
  
    b. Change `CONNECT TO WEBSTORE` near the top of this file to connect to a
    different database you wish to use
    
2. Run the SQL to create the tables. Run ```db2 -tvf webstore.ddl``` from the Db2
 command line. You can also run the script using Data Server Manager. If you use DSM,
  make sure the SQL Editor Run Method (Edit SQL Options) is set to CLP with SSH.


## Setting up the app

Start your app locally with the following command
  ```
  npm run test
  ```
The app will be launched at http://localhost:8888/
