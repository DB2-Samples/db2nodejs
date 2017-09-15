'use strict';
const async = require('async');

let minTimeout = 500;	// Minimum amount of time between customer actions
let maxTimeout = 1000;

UserLoad.prototype.setMaxTimeout = UserRotate.prototype.setMaxTimeout = (time) => {
    maxTimeout = time;
}

UserLoad.prototype.setMinTimeout = UserRotate.prototype.setMinTimeout = (time) => {
    minTimeout = time;
}

UserLoad.prototype.getRandomInt = UserRotate.prototype.getRandomInt = (minimum, maximum) => {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

UserLoad.prototype.minTimeout = UserRotate.prototype.minTimeout = minTimeout;

UserLoad.prototype.maxTimeout = UserRotate.prototype.maxTimeout = maxTimeout;

UserLoad.prototype.delayQuery = UserRotate.prototype.delayQuery = function(call) {
    let {getRandomInt} = this;
    let waitTime = getRandomInt(minTimeout, maxTimeout);
    setTimeout(call, waitTime);
}

let UserLoad = function() {

    // this.minTimeout = minTimeout;
    // this.maxTimeout = maxTimeout;

    this.init = (purchasingPool, customerServicePool) => {
        this.purchasingPool = purchasingPool;
        this.customerServicePool = customerServicePool;
    }

    // this.getRandomInt = (minimum, maximum) => {
    //     return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    // }

    this.decideBuy = (difficulty) => this.getRandomInt(0,10)>difficulty;

    this.convertSQLWithCallback = (sql, funcs) => {
        let result = {};
        if(funcs.startCall && funcs.successCall && funcs.errorCall && this.id){
            let {startCall, successCall, errorCall} = funcs;
            let id = this.id;
            result = {query:sql, startCall: startCall(id), successCall: successCall(id), errorCall: errorCall(id)};
            return result;
        }
        else return sql
    }

    this.tryCallBack = (sql, name) => {
        if(this.callBackFuncs && this.callBackFuncs[name]){
            return this.convertSQLWithCallback(sql, this.callBackFuncs[name]);
        }
        else return sql;
    }

    this.login = (id) => {
        this.id = id;
        let sql = "select * from WEBSTORE.CUSTOMER order by RAND() fetch first 1 rows only";
        sql = this.tryCallBack(sql, "login");
        let user = this.purchasingPool.singleQuery(sql)[0];
        this.name = user.C_SALUTATION + user.C_LAST_NAME;
        this.user = user;
    }

    this.logout = (id) => {

    }

    this.behaviour = (id, callBackFuncs) => {
        this.callBackFuncs = callBackFuncs;
        this.login(id);
        if (this.decideBuy(8)) {
            this.jsonStuff();
        }
        else if (this.decideBuy(7)) {
            this.alterOrder();
        }
        else {
            this.browse();
        }
    }

    // this.delayQuery = (call) => {
    //     let {getRandomInt, minTimeout, maxTimeout} = this;
    //     let waitTime = getRandomInt(minTimeout, maxTimeout);
    //     setTimeout(call, waitTime);
    // }

    this.browse = () => {
        let {user, getRandomInt} = this;
        let page = getRandomInt(1,3);
        let execute = () => {
            let sql = "select * from WEBSTORE.INVENTORY where INV_QUANTITY_ON_HAND > 0 order by RAND() fetch first 9 rows only";
            sql = this.tryCallBack(sql, "browse");
            let rows = this.purchasingPool.singleQuery(sql);
            this.buy(rows);
        }
        for(let i=0;i<page;i++){
            this.delayQuery(execute);
        }
    }

    this.buy = (rows) => {
        let {user, getRandomInt} = this;
        let item = rows[getRandomInt(0, rows.length)];
        if(this.decideBuy(6)){
            let execute = () => {
                let sql = 'INSERT INTO "WEBSTORE"."WEBSALES" ("WS_CUSTOMER_SK","WS_ITEM_SK","WS_QUANTITY") VALUES(' + user.C_CUSTOMER_SK + ', ' + item.INV_ITEM_SK + ', ' + getRandomInt(1, item.INV_QUANTITY_ON_HAND) + ');';
                sql = this.tryCallBack(sql, "buy");
                this.purchasingPool.singleQuery(sql);
            }
            execute();
        }
        this.logout(this.id);
    }

    this.alterOrder = () => {
        let {user} = this;
        let execute = () => {
            let sql = "select * from WEBSTORE.WEBSALES where WS_CUSTOMER_SK = " + user.C_CUSTOMER_SK + " order by RAND() fetch first 1 rows only";
            sql = this.tryCallBack(sql, "alterorder");
            let order = this.customerServicePool.singleQuery(sql)[0];
            if (order.WS_ORDER_NUMBER) {
                if (this.decideBuy(6))
                    this.cancelOrder(order);
                else this.updateOrder(order);
            }
        }
        this.delayQuery(execute);
    }

    this.updateOrder = (order) => {
        let {user, getRandomInt} = this;
        let execute = () => {
            let sql = "UPDATE WEBSTORE.WEBSALES SET WS_QUANTITY = " + getRandomInt(1, 20) + " WHERE WS_CUSTOMER_SK = " + user.C_CUSTOMER_SK + " AND WS_ORDER_NUMBER = " + order.WS_ORDER_NUMBER + " AND WS_ITEM_SK = " + order.WS_ITEM_SK
            sql = this.tryCallBack(sql, "updateorder");
            this.customerServicePool.singleQuery(sql);
        }
        execute();
        this.logout(this.id);
    }

    this.cancelOrder = (order) => {
        let {user, getRandomInt} = this;
        let execute = () => {
            let sql = "DELETE FROM WEBSTORE.WEBSALES WHERE WS_CUSTOMER_SK = " + user.C_CUSTOMER_SK + " AND WS_ORDER_NUMBER = " + order.WS_ORDER_NUMBER + " AND WS_ITEM_SK = " + order.WS_ITEM_SK
            sql = this.tryCallBack(sql, "deleteorder");
            this.customerServicePool.singleQuery(sql);
        }
        execute();
        this.logout(this.id);
    }

    this.jsonStuff = () => {
        let {user} = this;
        let execute = () => {
            let sql = "INSERT INTO  \"WEBSTORE\".\"TESTJSON\" (\"JSON_FIELD\") VALUES(SYSTOOLS.JSON2BSON('" + JSON.stringify(user) + "'))" // It needs to be converted to a string before put in the sql
            sql = this.tryCallBack(sql, "jsonstuff");
            this.purchasingPool.singleQuery(sql);
            this.logout(this.id);
        }
        this.delayQuery(execute);
    }

}

let UserRotate = function() {

    this.keepRun = true;

    this.stop = () => {this.keepRun = false;}

    this.autoStop = (end) => {this.endTime = end;}

    this.start = (id, purchasingPool, customerServicePool, endTime, callBackFuncs) => {
        this.endTime = endTime;
        let execute = (cid) => () => {
            let user = new UserLoad();
            user.init(purchasingPool, customerServicePool);
            user.behaviour(cid, callBackFuncs);
        }
        let i = 0;
        async.whilst(
            () => {
                if(this.endTime) return Date.parse(new Date())<parseInt(this.endTime);
                else return this.keepRun;
            },
            (next) => {
                this.delayQuery(execute(id+"user"+(i++)));
                next();
            },
            (err)=>{
                this.stopCallBck();
            }
        )
    }

    this.stopCallBck = () => {}

}

module.exports.userLoad = UserLoad;
module.exports.userRotate = UserRotate;