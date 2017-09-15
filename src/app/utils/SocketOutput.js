
let Output = function (Socket, Cmd, Uid) {


    this.generateResult = (id, connNum, queryNum, state) => {
        let result = {userid: id, connNum, queryNum, state};
        result.timestamp = Date.parse(new Date()).toString().substr(0,10);
        result = JSON.stringify(result);
        console.log(result);
        return result;
    }

    this.generateCallback = (state) => (id) => (connNum, queryNum) => {
        let result = this.generateResult(id, connNum, queryNum, state);
        Socket.to(Uid).emit(Cmd, result);
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
        return result;
    }

    let userLoadSocketOutput = {
        login:["querying user table", "sign in", "failed to sign in"],
        browse:["querying inventory table", "inventory retrieved", "failed to retrieve"],
        buy:["insert websales table", "inserted successfully", "failed to insert"],
        alterorder:["alter websales table", "altered successfully", "failed to alter"],
        updateorder:["update websales table", "updated successfully", "failed to update"],
        deleteorder:["delete from websales table", "deleted successfully", "failed to delete"],
        jsonstuff:["json creation on table", "created successfully", "failed to create"]
    }

}

module.exports.output = Output;