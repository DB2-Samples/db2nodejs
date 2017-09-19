
let Output = function (Socket, Cmd, Uid) {

    this.generateResult = (id, username, connNum, queryNum, state) => {
        let result = {userid: id, connNum, queryNum, state, username};
        result.timestamp = Date.parse(new Date()).toString().substr(0,10);
        this.resultList.push(result);
        result.qrPS = this.formatMetric();
        return JSON.stringify(result);
    }

    this.formatMetric = () => {
        let lastOne = this.resultList[this.resultList.length-1];
        let qrPS = 0;
        this.resultList = this.resultList.filter((item)=>{
            if(parseInt(item.timestamp)<parseInt(lastOne.timestamp)-1) return false;
            qrPS += parseInt(item.queryNum);
            return true;
        });
        return qrPS;
    }

    this.generateCallback = (state) => (id, username) => (connNum, queryNum) => {
        let result = this.generateResult(id, username, connNum, queryNum, state);
        Socket.to(Uid).emit(Cmd, result);
    }

    this.endCall = (id, username) => () => {
        Socket.to(Uid).emit(Cmd, JSON.stringify({userid: id, resultCode: "end", username}));
    }

    this.generateCallbackFuncs = (stateList) => {
        let funcs = {};
        funcs.startCall = this.generateCallback(stateList[0]);
        funcs.successCall = this.generateCallback(stateList[1]);
        funcs.errorCall = this.generateCallback(stateList[2]);
        return funcs;
    }

    this.generateFucs4User = () => {
        let result = {};
        for(let key in userLoadSocketOutput){
            result[key] = this.generateCallbackFuncs(userLoadSocketOutput[key]);
        }
        result.endCall = this.endCall;
        this.resultList = [];
        return result;
    }

    let userLoadSocketOutput = {
        login:["querying user table-start", "signs in-success", "fails to sign in-error"],
        browse:["starts browsing(select)-process", "is browsing(select)-success", "is browsing(select)-error"],
        buy:["starts buying(insert) table-process", "is buying(insert)-success", "is buying(insert)-error"],
        alterorder:["starts checking(select)-process-1-2", "is checking(select)-success-2", "is checking(select)-error-2"],
        updateorder:["starts updating(update)-process-2", "is updating(update)-success-2", "is updating(update)-error-2"],
        deleteorder:["starts deleting(delete)-process-2", "is deleting(delete)-success-2", "is deleting(delete)-error-2"],
        jsonstuff:["starts json func(insert)-process", "completes json func(insert)-success", "completes json func(insert)-error"]
    }

}

module.exports.output = Output;