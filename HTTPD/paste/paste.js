var url = require("url"),
  qs = require('querystring'),
  files = require('../files'),
  db = require('../db'),
  redis = require("redis"),
  fs = require("fs"),
  client = redis.createClient();



exports.addFunctions = function(container) {
  container.paste = {};
  container.paste.POST = POST;
  container.paste.GET = GET;
  return container;
}

if (typeof pages === 'undefined'){pages = {};}
pages.paste = {};


POST = function(request, response, cookies) {
  generateRandom = function(length, charset) {
    if (length==0){return ""};
    return charset.charAt(Math.floor(Math.random() * charset.length)) + generateRandom(length-1, charset);
  }
  var random = generateRandom(10, charset);

  var body = '';
  request.on('data', function (data) {
    body += data;
    if (body.length > 1e7) { 
      request.connection.destroy();
    }
  });
  request.on('end', function () {
    var POST = qs.parse(body);
    client.sadd("paste:"+random, POST.paste+"");
    if (cookies.hyperion != null){
      client.rpush(cookies.hyperion+":paste", POST.paste+"")
    }
  });

  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("/paste/p/"+random);
}


GET = function(request, response) {
  var uri = url.parse(request.url).pathname;
  var parts = uri.split("/"); 
  var fn_name = "GET_"+parts[2];
  if (typeof pages.paste[fn_name] === 'function'){
    pages.paste[fn_name](request, response, parts.slice(3));
  }
  else {
    filename = defualt_filename+uri;
    files.get_file(filename, response);
  }
}


pages.paste.GET_p = function(request, response, data){
  if (data[0] == "p"){
    response.writeHead(200, {"Content-Type": "text/plain"});
    var name = client.smembers("paste:"+data[1], function(error, redis_reply){
      response.write(redis_reply[0]);
      response.end();
    });
  }
  else {
    filename = defualt_filename+"/paste/view.html";
    files.get_file(filename, response);
  }
}
