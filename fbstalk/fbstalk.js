var files = require('../files');
var mongo = require('./mongo');
var qs = require('querystring');
var https = require('https');

exports.init = function(add_page) {
    add_page(["chatgraph"], "get", function(request, response, cookies) {
        files.get_file("fbstalk/index.html", response);
    });

    add_page(["chatgraph", "login"], "post", function(request, response, cookies) {
        var body = '';
        request.on('data', function (data) {
            body+=data;
            if (body.length > 1e7) {
                request.connection.destroy();
            }
        });
        request.on('end', function(){
            var post_data = qs.parse(body);
            var options = {
                host: 'graph.facebook.com',
                port: 443,
                path: strcct(['/oauth/access_token?',
                              'client_id=713859081958103&',
                              'client_secret=7481bb71bf2f9b7cb2a4aadc3d24d86b&',
                              'grant_type=fb_exchange_token&',
                              'fb_exchange_token=',
                               post_data.token
                             ])
            };
            
            https.get(options, function(res) {
                var fb_reply = '';
                res.on('data', function(chunk){
                    fb_reply+=chunk;
                });
                res.on('end', function(){
                    var long_access_token = qs.parse(fb_reply).access_token;
                    var db_insert = {name:post_data.name, acct_id:post_data.id, access_token:long_access_token, priv_acct:[]};
                    console.log(db_insert);
                    mongo.users.find({acct_id:post_data.id}, function(err, data){
                        if (err || !data || data.length==0){
                            console.log("that is a new user!");
                            console.log(err);
                            mongo.users.save(db_insert, function(err, data){
                                response.writeHead(200, {"Content-Type":"text/plain"});
                                if (err){
                                    response.end("/chatgraph/error/database");
                                } else {
                                    response.end("/chatgraph/"+post_data.id+"/friends/graphs");
                                }
                            });
                        } else {
                            response.writeHead(200, {"Content-Type": "text/plain"});
                            response.end("/chatgraph/" + post_data.id + "/friends/graphs");
                        }
                    });
                });
            }).on('error', function(e) {
                  console.log("Got error: " + e.message);
                  response.writeHead(200, {"Content-Type": "text/plain"});
                  response.end(e.message);
            });

        });
    });
}

strcct = function(strs){
    var res = '';
    strs.forEach(function(data){
        res+=data;
    });
    return res;
}
