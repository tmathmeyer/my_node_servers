var files = require('../files');
var mongo = require('./mongo');
var qs = require('querystring');
var https = require('https');
var facebook = require('./facebook');
var colors = require('colors');

exports.init = function(add_page) {
    add_page(["chatgraph"], "get", function(request, response, cookies) {
        files.get_file("fbstalk/index.html", response);
    });


    add_page(["chatgraph", "me", "_var", "graphs"], "get", function(request, response, cookies, userID){
        files.get_file("fbstalk/megraph.html", response);
    });


    add_page(["chatgraph", "user", "_var", "graphs"], "get", function(request, response, cookies, userID){
        files.get_file("fbstalk/usergraph.html");
    });


    add_page(["chatgraph", "user", "_var", "raw"], "get", function(request, response, cookies, userID){
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end(""+userID);
    });


    add_page(["chatgraph", "me", "_var", "raw", "_var", "_var"], "get", function(request, response, cookies, userID, start, end){
        mongo.users.find({acct_id:userID}, function(err, qr){
            var query_result = qr[0];
            response.writeHead(200, {"Content-Type" : "text/JSON"});
            if (err){
                response.end("{'error': 'no valid user in the database!'}");
            } else {
                var f_size = query_result.friends.length;
                var payload = [];
                
                query_result.friends.forEach(function(friend_uuid){
                    mongo.accounts.findOne({id:friend_uuid+""}, function(err, fqr){
                        if (!err){
                            var resp_inf = {
                                id:   fqr.id,
                                name: fqr.name,
                                data: filter(fqr.online, function(point){
                                    var t = parseInt(point.time, 10);
                                    if (end == 0){
                                        return t > start;
                                    } else {
                                        return t > start && t < end;
                                    }
                                })
                            }
                            payload.push(resp_inf);
                            f_size --;
                        }
                        if (f_size == 0){
                            response.end(JSON.stringify(payload));
                        }
                    });
                });
            }
        });
    });

    add_page(["chatgraph", "me", "_var"], "get", function(request, response, cookies){
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("please add /graphs to the end of the URL");
    });

    add_page(["chatgraph", "user", "_var"], "get", function(request, response, cookies){
        response.writeHead(200, {"Content-Type":"text/plain"});
        response.end("please add /graphs to the end of the URL");
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
                    
                    facebook.getFbData(long_access_token, '/me?fields=friends,name', function(friends_response){
                    
                        var db_insert = {
                            name:friends_response.name,
                            acct_id:post_data.id,
                            access_token:long_access_token,
                            friends:map(friends_response.friends.data, function(val){
                                return val.id;
                            })
                        };
                    
                        friends_response.friends.data.forEach(function(friend){
                            var acct_dbins = {
                                name:friend.name,
                                token:long_access_token,
                                id:friend.id,
                                online:[]
                            };
                            if (mongo.accounts.find().length == 0){
                                mongo.accounts.save(acct_dbins);
                            }
                        });

                        mongo.users.find({acct_id:post_data.id}, function(err, data){
                            if (err || !data || data.length==0){
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

                });
            }).on('error', function(e) {
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

// [ {A, B, C, D,...} ] -> ({A, B, C, D,...} -> X) -> [X]
map = function(arr, keep){
    var rest = [];
    arr.forEach(function(val){
        rest.push(keep(val));
    });
    return rest;
}

filter = function(arr, keep){
    var rest = [];
    arr.forEach(function(val){
        if (keep(val)){
            rest.push(val);
        }
    });
    return rest;
}
