var http = require("http"),
    url = require("url"),
    files = require('./files'),
    modules = require("./webmodule").read();

port = 25565;
defualt_filename = "/home/ted/HTTPD"
charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	
	if (request.method == 'POST') {
		if (uri == "/") {
			//there is literally nothing here. go to index.html
		}
		else {
			var module = uri.split("/")[1];
			modules[module].POST(request, response);
		}
	}
	else if (request.method == 'GET') {
		if (uri == "/") {
			files.get_file("/home/ted/HTTPD/home/index.html", response);
		}
		else {
			var module = uri.split("/")[1];
			if (modules[module]) {
				modules[module].GET(request, response);
			}
			else {
				filename = defualt_filename+uri;
				console.log(filename);
				files.get_file(filename, response);
			}
		}
	}
}).listen(parseInt(port, 10));
