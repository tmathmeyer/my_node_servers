var http = require('http'),
    url = require("url"),
    files = require('../files'),
    redis = require("redis"),
    client = redis.createClient(),
    crypto = require('crypto'),
    qs = require('querystring');


exports.init = function(add_page) {
  add_page(["login"], "get", function(request, response) {
    files.get_file("login/index.html", response);
  });


  add_page(["login","auth"], "post", function(request, response) {
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
        fail = function() {
          response.writeHead(200, {'Content-Type': 'text/plain'});
          response.end("null");
        }
        succede = function() {
          var cookie =  'hyperion='+acct+";";
              cookie += 'expires='+new Date(new Date().getTime()+86400000).toUTCString();
          response.writeHead(200, {'Content-Type':'text/plain'});
          response.end(cookie);
        }

        if (!reply) {
          client.set(POST.username+"", acct+"", function(err){
            if (err){
              fail();
            } else {
              console.log(POST.username + " has created an account");
              succede();
            }
          });
        } if (reply == acct) {
          succede();
        } else {
          fail();
        }
      });
    });
  });
}

//structure:
// there is a list names accounts,
//  where each element is a hshed account

// there is also a kvp called <account>+"username"
// there is also a kvp called <usernme> with the data being the acct hash

// all other account associated data is known as <account>+<data> and is usually a list
