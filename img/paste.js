var url = require("url"),
	qs = require('querystring'),
	db = require('../db'),
	files = require('../files'),
	redis = require("redis"),
	client = redis.createClient();

exports.addFunctions = function(container) {
	container.paste = {};
	container.paste.POST = POST;
	container.paste.GET = GET;
	return container;
}

POST = function(request, response) {
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
		console.log(POST.paste);
		db.put(client, random, POST.paste);
	});

	response.writeHead(200, {"Content-Type": "text/plain"});
	response.end("/paste/p/"+random);
}

GET = function(request, response) {
	var uri = url.parse(request.url).pathname;
	var sub = uri.split("/")[2];
	if (sub && sub=="p") {
		response.writeHead(200, {"Content-Type": "text/plain"});
		var name = db.get(client, uri.split("/")[3], function(data){
			response.write(data+"");
			response.end();
		});
	}
	else {
		filename = defualt_filename+uri;
		console.log(filename);
		files.get_file(filename, response);
	}
}
