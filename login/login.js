var http = require('http'),
    url = require("url"),
    files = require('../files'),
    redis = require("redis"),
    client = redis.createClient(),
    crypto = require('crypto'),
    qs = require('querystring');

//http.createServer(function (request, response) {
//  // To Get a Cookie
//  var cookies = {};
//  request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
//    var parts = cookie.split('=');
//    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
//  });
//
//  // To Write a Cookie
//  response.writeHead(200, {
//    'Set-Cookie': 'mycookie=test',
//    'Content-Type': 'text/plain'
//  });
//  response.end('Hello World\n');
//}).listen(80);
//
//console.log('Server running at http://127.0.0.1:80/');





exports.addFunctions = function(container) {
  container.login = {};
  container.login.POST = POST;
  container.login.GET = GET;
  return container;
}


if (typeof pages === 'undefined'){pages = {};}
pages.login = {};



GET = function(request, response) {
  var uri = url.parse(request.url).pathname;
  var parts = uri.split("/");
  var fn_name = "GET_"+parts[2];
  if (typeof pages.login[fn_name] === 'function'){
    pages.login[fn_name](request, response, parts.slice(3));
  }
  else{
    console.log("\""+fn_name+"\"");
    files.get_file("login/index.html", response);
  }
}




pages.login.GET_ok = function(request, response, data){
  var cookie =  'hyperion='+data[1]+";";
      cookie += 'expires='+new Date(new Date().getTime()+86400000).toUTCString();
  response.writeHead(200, {
    'Content-Type':'text/plain'
  });
  response.end(cookie);
}




pages.login.GET_failed = function(request, response, data){
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end("FAILED LOGIN");
}





pages.login.GET_undefined = function(request, response, data){
  files.get_file("login/index.html", response);
}





POST = function(request, response, cookies) {
  var body = '';
  request.on('data', function (data) {
    body += data;
    if (body.length > 1e7) { 
      request.connection.destroy();
    }
  });
  request.on('end', function () {
    var POST = qs.parse(body);
    var shasum = crypto.createHash('sha1');
    shasum.update(POST.username, 'ascii');
    shasum.update(POST.password, 'ascii');
    var acct = shasum.digest('hex');
    client.get(POST.username+"", function(err, reply){
      if (reply != null){
        if (reply == acct)
        {
          var cookie = 'mycookie='+acct+';';
              cookie = 'expires='+86409000;
          response.writeHead(200, {'Content-Type': 'text/plain'});
          response.end("/login/ok/auth/"+acct);
          return;
        }
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("/login/failed/taken-invalid");
        return;
      }
      else {
        client.set(POST.username+"", acct+"", function(err, reply){
          if (err){
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.end("/login/failed/unknown");
            return;
          }
          else
          {
            console.log(POST.username +" has created an account")
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end("/login/ok/new/"+acct);
            client.rpush("accounts", acct);
            client.set(acct+":username", POST.username, function(err, reply){
              console.log(err);
              console.log(reply);
            });
            return;
          }
        });
      }
    });
  });
}
