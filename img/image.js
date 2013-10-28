var url = require("url"),
  qs = require('querystring'),
  files = require('../files'),
  redis = require("redis"),
  client = redis.createClient();

var formidable = require("formidable");
var fs = require("fs");



exports.addFunctions = function(container) {
  container.img = {};
  container.img.POST = POST;
  container.img.GET = GET;
  return container;
}

if (typeof pages === 'undefined'){pages = {};}
pages.img = {};


POST = function(request, response, cookies) {
  generateRandom = function(length, charset) {
    if (length==0){return ""};
    return charset.charAt(Math.floor(Math.random() * charset.length)) + generateRandom(length-1, charset);
  }
  var random = generateRandom(10, charset);
  response.writeHead(200, {"Content-Type": "text/plain"});
  upload(request, response, random);
  response.end("/img/i/"+random);
}


GET = function(request, response, cookies) {
  var uri = url.parse(request.url).pathname;
  var parts = uri.split("/"); 
  var fn_name = "GET_"+parts[2];
  if (typeof pages.img[fn_name] === 'function'){
    pages.img[fn_name](request, response, parts.slice(3), cookies);
  }
  else {
    filename = "/home/ted/HTTPD/img/index.html";
    files.get_file(filename, response);
  }
}

pages.img.GET_i = function(request, response, parts, cookies) {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.end("<html><body><img src='../content/"+parts[0]+"/image.jpg'></body></html>");
}

pages.img.GET_content = function(request, response, parts, cookies) {
  files.get_file("/home/ted/HTTPD/img/.data/"+parts[0]+"/image.jpg", response);
}


function upload(request, response, number) {
  var form = formidable.IncomingForm()
  var util = require('util'),
      fields = [],
      files = []
  form.on('file', function(field, file) {
    files.push([field, file]);
    fs.mkdir("/home/ted/HTTPD/img/.data/"+number+"/", function() {
      var source = fs.createReadStream(file.path);
      var dest = fs.createWriteStream('/home/ted/HTTPD/img/.data/'+number+'/image.jpg');
      source.pipe(dest);
    });
  });
  form.parse(request);
}