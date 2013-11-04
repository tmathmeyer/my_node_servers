var path = require("path"),
    fs = require("fs"),
    getDirName = require("path").dirname;

exports.get_file = function(filename, response) {
	path.exists(filename, function(exists) {
		if(!exists) {
			//this will eventually become part of a framework operation where server managers can specify 404 counts with X time that will serv back error messages
			if (response.connection.remoteAddress.indexOf("66.197.237") != -1){ //this person requested a ton of php files?? I'll sort them out ;)
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.end("Hi there! it seems you've been requesting a bunch of pages pertaining to PHP etc. This server isn't running PHP, or really any other language. I wrote it by hand, and it is running on my desktop. If you have any questions, please email tmathmeyer@gmail.com. Thanks")
				return;
			} else {
				console.log(filename + " 404d  from: "+response.connection.remoteAddress+"  @"+new Date());
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}
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
