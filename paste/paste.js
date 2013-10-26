var url = require("url"),
  qs = require('querystring'),
  files = require('../files'),
  redis = require("redis"),
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
    //client.sadd("paste:"+random, POST.paste+"");
    //files.make_folder("/home/ted/HTTPD/paste/.data/"+random);
    files.write_file("/home/ted/HTTPD/paste/.data/"+random, POST.paste, function(a){console.log("fuck: "+a)});
    if (cookies.hyperion != null){
      client.rpush(cookies.hyperion+":paste", random+"")
    }
  });

  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("/paste/p/"+random);
}


GET = function(request, response, cookies) {
  var uri = url.parse(request.url).pathname;
  var parts = uri.split("/"); 
  var fn_name = "GET_"+parts[2];
  if (typeof pages.paste[fn_name] === 'function'){
    pages.paste[fn_name](request, response, parts.slice(3), cookies);
  }
  else {
    filename = defualt_filename+uri;
    files.get_file(filename, response);
  }
}
  

pages.paste.GET_p = function(request, response, data){
  if (data[0] == "p"){
    response.writeHead(200, {"Content-Type": "text/plain"});
    files.get_file("/home/ted/HTTPD/paste/.data/"+data[1]+"/paste.content", response);
  }
  else {
    filename = defualt_filename+"/paste/view.html";
    files.get_file(filename, response);
  }
}

pages.paste.GET_my = function(request, response, url_data, cookies){
  if (url_data[0] != "pastes"){
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
  }
  else{
    files.get_file("/home/ted/HTTPD/paste/list.html", response);
  }
}