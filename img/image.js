var url = require("url");
var qs = require('querystring');
var files = require('../files');
var client = require("redis").createClient();
var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

var formidable = require("formidable");
var fs = require("fs");


exports.init = function(add_page) {
  add_page(["img"], "get", function(http_params) {
    files.get_file("img/index.html", http_params[1]);
  });


  add_page(["img", "i", "_var"], "get", function(http_params, url_params) {
    http_params[1].writeHead(200, {"Content-Type": "text/html"});
    http_params[1].end("<html><body><img src='/img/content/"+url_params[0]+"'></body></html>");
  });


  add_page(["img", "content", "_var"], "get", function(http_params, url_params) {
    console.log("get");
    files.get_file("img/.data/"+url_params[0]+"/image.jpg", http_params[1]);
  });


  add_page(["img","post","content"], "post", function(http_params, url_params) {
    var random = generateRandom(10, charset);
    http_params[1].writeHead(200, {"Content-Type": "text/plain"});
    upload(http_params[0], http_params[1], random);
    http_params[1].end("/img/i/"+random);
  });
}

generateRandom = function(length, charset) {
  if (length==0){return ""};
  return charset.charAt(Math.floor(Math.random() * charset.length)) + generateRandom(length-1, charset);
}

function upload(request, response, number) {
  var form = formidable.IncomingForm()
  var util = require('util'),
      fields = [],
      files = []
  form.on('file', function(field, file) {
    files.push([field, file]);
    fs.mkdir("img/.data/"+number+"/", function() {
      var source = fs.createReadStream(file.path);
      var dest = fs.createWriteStream('img/.data/'+number+'/image.jpg');
      source.pipe(dest);
    });
  });
  form.parse(request);
}