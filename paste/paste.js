var url = require("url");
var qs = require('querystring');
var files = require('../files');
var client = require("redis").createClient();
var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


exports.init = function(add_page) {
  add_page(["paste","p","p","_var"], "get", function(request, response, cookies, image_location) {
    files.get_file("paste/.data/"+image_location+"/paste.content", response);
  });


  add_page(["paste","p", "_var"], "get", function(request, response, cookies) {
    files.get_file("paste/view.html", response);
  });

  add_page(["paste"], "get", function(request, response, cookies) {
    files.get_file("paste/index.html", response);
  });

  add_page(["paste", "my"], "get", function(request, response, cookies) {
    response.writeHead(200, {"Content-Type":"text/plain"});
    if (cookies.hyperion){
      client.lrange(cookies.hyperion+":paste", 0, -1, function(err, payload){
        if (!payload[0]){
          response.write("");
          response.end();
          return;
        }
        response.write(""+payload);
        response.end();
      });
    }
  });

  add_page(["paste", "my","pastes"], "get", function(request, response, cookies) {
    files.get_file("paste/list.html", response);
  });


  add_page(["paste","post","content"], "post", function(request, response, cookies) {
    var body = '';
    var random = generateRandom(5, charset);
    request.on('data', function (data) {
      body += data;
      if (body.length > 1e7) { 
        request.connection.destroy();
      }
    });
    request.on('end', function () {
      var POST = qs.parse(body);
      files.write_file("paste/.data/"+random, POST.paste, function(err) {
        if (err)console.log(err);
      });
      if (cookies.hyperion != null){
        client.rpush(cookies.hyperion+":paste", random+"")
      }
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.end("/paste/p/"+random);
    });
  });
}

generateRandom = function(length, charset) {
  if (length==0){return ""};
  return charset.charAt(Math.floor(Math.random() * charset.length)) + generateRandom(length-1, charset);
}
