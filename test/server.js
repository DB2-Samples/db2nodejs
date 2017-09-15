var http=require("http");
var server=http.createServer(function(req,res){
    if(req.url!=="/favicon.ico"){
        res.writeHead(200,{"Content-Type":"text/plain","Access-Control-Allow-Origin":"http://localhost"});
        res.write("hello!");
    }
    res.end();
});
server.listen(1337,"localhost",function(){
    console.log("start...");
});
