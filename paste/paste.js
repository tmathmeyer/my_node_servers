var url = require("url");
var qs = require('querystring');
var files = require('../files');
var client = require("redis").createClient();
var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


exports.init = function(add_page) {
  add_page(["paste","p", "_var"], "get", function(http_params) {
    files.get_file("/home/ted/git/nodeserver/paste/view.html", http_params[1]);
  });


  add_page(["paste","p","p","_var"], "get", function(http_params, url_params) {
    files.get_file("/home/ted/git/nodeserver/paste/.data/"+url_params[0]+"/paste.content", http_params[1]);
  });


  add_page(["paste"], "get", function(http_params) {
    files.get_file("/home/ted/git/nodeserver/paste/index.html", http_params[1]);
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
      files.write_file("/home/ted/git/nodeserver/paste/.data/"+random, POST.paste, function(err) {
        console.log(err);
      });
      //if (cookies.hyperion != null){
      //  client.rpush(cookies.hyperion+":paste", random+"")
      //}
      http_params[1].writeHead(200, {"Content-Type": "text/plain"});
      http_params[1].end("/paste/p/"+random);
    });
  });
}

generateRandom = function(length, charset) {
  if (length==0){return ""};
  return charset.charAt(Math.floor(Math.random() * charset.length)) + generateRandom(length-1, charset);
}