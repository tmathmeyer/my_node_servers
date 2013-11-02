var path = require("path"),
    fs = require("fs"),
    getDirName = require("path").dirname;

exports.get_file = function(filename, response) {
	path.exists(filename, function(exists) {
		if(!exists) {
			console.log(filename + " 404d");
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		} else if (filename == "/") {
			filename = 'home';
		} 
		if (fs.statSync(filename).isDirectory()) {
			filename += '/index.html';
		}		
		fs.readFile(filename, "binary", function(err, file) {
			if(err) {
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}
			response.writeHead(200);
			response.write(file, "binary");
			response.end();
		});
	});
}

exports.write_file = function(filename, file_data, cb){
	exports.make_folder(filename, function (err) {
    	if (err) return cb(err);
    	fs.writeFile(filename+"/paste.content", file_data, cb);
  	})
}

exports.make_folder = function(filename, cb) {
	fs.mkdir(filename, cb);
}
