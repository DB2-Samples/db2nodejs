# DB2 NodeJS Mock Webstore Sample

db2-node-demo is a simple implementation of an app running on Node.js runtime demonstrating how to connect Node.js applications to DB2.

## Node App Setup

1. Before you can clone the larger files in this repository, you will need to install Git Large File Storage. You can get it here: https://git-lfs.github.com/

2. Clone the app to your local environment from your terminal using the following command:

  ```
    git clone https://github.ibm.com/mkhattab/db2-node-demo.git
  ```

3. `cd` into this newly created directory

4. Install the required npm and bower packages using the following command

  ```
  npm install
  ```

5. Replace the corresponding credentials for your DB2 sample database in your index.js file

```
        db: "SAMPLE",
        hostname: "LOCALHOST",
        port: 50000,
        username: "DB2INST1",
        password: ""
```

7. Start your app locally with the following command

  ```
  node index.js
  ```
  or
  ```
  npm start
  ```

## Database Setup
To create the TPCDS database
    
    Extract the tpcds-db.tar.gz to your machine

    navigate to the local folder where you extracted the above file

    open the folder 

    To create a ROW store TPCDS database

    Run setup.sh for Row store DB2

    unset DB2_WORKLOAD registry variable for row base database

     e.g.

     db2set DB2_WORKLOAD=

    ./setup.sh 2>&1 | tee setup.out;

    To create a COLUMN store TPCDS database

    Run setup_column_store.sh for Column store DB2

     set the DB2_WORKLOAD registry variable to ANALYTICS for Columnar Database

     e.g.

     db2set DB2_WORKLOAD=ANALYTICS

    ./setup_column_store.sh 2>&1 | tee setup_column_store.out;


The setup script will:
1. Create a new TPCDS_1G database
2. Create the TPCDS tables
3. Create Constraints for ROW store DB2
4. Load data into TPCDS tables
5. RUNSTATS for TPCDS tables
6. select the number of rows inserted into each TPCDS tables.

After running the setup, you can verify the number of rows inserted
into each table matched with the select count(*) output below.

```call_center                6
catalog_page                11718
catalog_returns                144222
catalog_sales                1440020
customer                100000
customer_address        50000
customer_demographics        1920800
date_dim                73049
dbgen_version                1
household_demographics        7200
income_band                20
inventory                11745000
item                        18000
promotion                300
reason                        35
ship_mode                20
store                        12
store_returns                287607
store_sales                2880143
time_dim                86400
warehouse                5
web_page                60
web_returns                72176
web_sales                720068
web_site                30
repair                        10000
