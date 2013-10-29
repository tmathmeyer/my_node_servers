var url = require("url");
var qs = require('querystring');
var files = require('../files');
var client = require("redis").createClient();
var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


exports.init = function(add_page) {
  add_page(["paste","p","p","_var"], "get", function(http_params, url_params) {
    files.get_file("paste/.data/"+url_params[0]+"/paste.content", http_params[1]);
  });


  add_page(["paste","p", "_var"], "get", function(http_params) {
    files.get_file("paste/view.html", http_params[1]);
  });

  add_page(["paste"], "get", function(http_params) {
    files.get_file("paste/index.html", http_params[1]);
  });

  add_page(["paste", "my"], "get", function(http_params) {
    http_params[1].writeHead(200, {"Content-Type":"text/plain"});
    if (http_params[2].hyperion){
      client.lrange(http_params[2].hyperion+":paste", 0, -1, function(err, payload){
        if (!payload[0]){
          http_params[1].write("");
          http_params[1].end();
          return;
        }
        http_params[1].write(""+payload);
        http_params[1].end();
      });
    }
  });

  add_page(["paste", "my","pastes"], "get", function(http_params) {
    files.get_file("paste/list.html", http_params[1]);
  });


  add_page(["paste","post","content"], "post", function(http_params, url_params) {
    var body = '';
    var random = generateRandom(5, charset);
    http_params[0].on('data', function (data) {
      body += data;
      if (body.length > 1e7) { 
        http_params[0].connection.destroy();
      }
    });
    http_params[0].on('end', function () {
      var POST = qs.parse(body);
      files.write_file("paste/.data/"+random, POST.paste, function(err) {
        console.log(err);
      });
      if (http_params[2].hyperion != null){
        client.rpush(http_params[2].hyperion+":paste", random+"")
      }
      http_params[1].writeHead(200, {"Content-Type": "text/plain"});
      http_params[1].end("/paste/p/"+random);
    });
  });
}

generateRandom = function(length, charset) {
  if (length==0){return ""};
  return charset.charAt(Math.floor(Math.random() * charset.length)) + generateRandom(length-1, charset);
}