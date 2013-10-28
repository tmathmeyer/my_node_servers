var http = require("http");
var url = require("url");
var files = require('./files');
var modules = require("./webmodule").read();
var port = 80;
var defualt_filename = "/home/ted/HTTPD"
var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	
	var cookies = {};
	request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	});
	
	if (request.method == 'POST') {
		if (uri != "/") {
			var module = uri.split("/")[1];
			modules[module].POST(request, response, cookies);
		}
	}
	else if (request.method == 'GET') {
		if (uri == "/") {
			files.get_file("/home/ted/HTTPD/home/index.html", response);
		}
		else {
			var module = uri.split("/")[1];
			if (modules[module]) {
				modules[module].GET(request, response, cookies);
			}
			else {
				filename = defualt_filename+uri;
				files.get_file(filename, response, cookies);
			}
		}
	}
}).listen(parseInt(port, 10));
