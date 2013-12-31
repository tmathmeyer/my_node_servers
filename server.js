var http = require("http");
var url = require("url");
var modules = require("./webmodule");
var files = require("./files");
var port = 8000;

modules.init();

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	var cookies = {};
	request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	});

	type = "";
	if (request.method == 'POST') {
		type = "_post";
	} else if (request.method == 'GET') {
		type = "_get";
	}

	var success = modules.viewPage(uri.split("/").slice(1), type, [request, response, cookies]);
	if (! success){
		files.get_file(uri.substr(1), response);
	}

}).listen(parseInt(port, 10));
