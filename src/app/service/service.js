function LoadData(msgContainer){
    this.load = function(params){
        var user = location.pathname;
        var progress = $('#progressBar')[0];
        var progressdiv = $('#progressBar div')[0];
        progress.style.display="block";
        progressdiv.style.backgroundColor = 'transparent';
        var that = this;
        $.ajax({
            type: 'get',
            url: user+'/upload',
            data: params,
            dataType: 'json',
            success: function (data) {
                progressdiv.style.backgroundColor = '#007bff';
                that.popup(data);
                return ;
            },
            error: function (err) {
                progressdiv.style.backgroundColor = '#dc3545';
                $('#progressBar div span')[0].style.backgroundColor = "#dc3545";
                that.popup(err);
                return ;
            }
        });
    }
    this.popup = function(data){
        var that = this;
        var params = {
            severity: "error",
            title:"TIMEOUT!",
            body:"Cannot connect to express server.",
            okHandler:that.hideDialog
        }
        if(data.severity){
            params = data;
            params.okHandler = that.hideDialog;
            that.showDialog(params);
        }
        else{
            that.showDialog(params);
        }
    }
    this.showDialog = function(params){
        var dialog = $('#popupDialog')[0];
        var main = $('.main')[0];
        if(params.severity){
            switch(params.severity){
                case 'success': {dialog.className="alert alert-success topWarn"; break;}
                case 'error': {dialog.className="alert alert-danger topWarn"; break;}
                case 'warn': {dialog.className="alert alert-warning topWarn"; break;}
                default: {dialog.className="alert alert-info topWarn"; break;}
            }
        }
        var btn = dialog.querySelector('#okBtn');
        btn.style.display = "none";
        if(params.okHandler){
            btn.style.display = "inline-block";
            btn.onclick = params.okHandler;
        }
        btn = dialog.querySelector('#cancelBtn');
        btn.style.display = "none";
        if(params.cancelHandler){
            btn.style.display = "inline-block";
            btn.onclick = params.cancelHandler;
        }
        if(params.title){
            dialog.querySelector('strong').innerHTML = params.title;
        }
        if(params.body){
            dialog.querySelector('span').innerHTML = params.body;
        }
        dialog.style.top = "76px";
        main.className = "main blur";
    }
    this.hideDialog = function(){
        var dialog = $('#popupDialog')[0];
        var main = $('.main')[0];
        dialog.style.top = "-10px";
        main.className = "main";
        $('#progressBar')[0].style.display = "none";
    }
}