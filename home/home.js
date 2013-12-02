var files = require('../files');

exports.init = function(add_page) {
  add_page(["log"], "get", function(request, response) {
    files.get_file("home/server.log", response);
  });
}