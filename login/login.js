var http = require('http'),
    files = require('../files'),
    redis = require("redis"),
    client = redis.createClient(),
    crypto = require('crypto'),
    qs = require('querystring');

http.createServer(function (request, response) {
  // To Get a Cookie
  var cookies = {};
  request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });

  // To Write a Cookie
  response.writeHead(200, {
    'Set-Cookie': 'mycookie=test',
    'Content-Type': 'text/plain'
  });
  response.end('Hello World\n');
}).listen(80);

console.log('Server running at http://127.0.0.1:80/');





exports.addFunctions = function(container) {
  container.login = {};
  container.login.POST = POST;
  container.login.GET = GET;
  return container;
}

GET = function(request, response) {
  files.get_file("login/index.html", response);
}

POST = function(request, response) {
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
      console.log(reply);
      if (reply != null){
        if (reply == acct)
        {
          var cookie = 'mycookie='+acct+';';
              cookie = 'expires='+86409000;
          response.writeHead(200, {
            'Set-Cookie':'sesh=wakadoo; expires='+new Date(new Date().getTime()+86409000).toUTCString()
            //'Content-Type': 'text/plain'
          });
          response.end("/login/ok/auth/"+POST.username);
          return;
        }
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("/login/failed/taken-invalid");
        return;
      }
      else {
        //console.log("the account testaccount is in the server for testing (pass = 'test')");
        client.set(POST.username+"", acct+"", function(err, reply){
          console.log(reply.toString());
          if (err){
            console.log("error");
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.end("/login/failed/unknown");
            return;
          }
          else
          {
            console.log(POST.username +" has created an account")
            var cookie = 'mycookie='+acct+';';
                cookie = 'expires='+86409000;
            response.writeHead(200, {
              'Set-Cookie': cookie,
              'Content-Type': 'text/plain'
            });
            response.end("/login/ok/new/"+POST.username);
            return;
          }
        });
      }
    });
  });
}
