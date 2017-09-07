var http = require("http");
var fs = require("fs");

var str='{"id":"123",name:"jack",arg:11111}';

function onRequest(request, response){
 console.log("Request received.");
 response.writeHead(200,{"Content-Type":'text/plain','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});//可以解决跨域的请求
 //response.writeHead(200,{"Content-Type":'application/json',   'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
 //response.write("Hello World 8888\n");

 str=fs.readFileSync('data.txt');
 response.write(str);
 response.end();
}

http.createServer(onRequest).listen(8888);

console.log("Server has started.port on 8888\n");
console.log("test data: "+str.toString());
