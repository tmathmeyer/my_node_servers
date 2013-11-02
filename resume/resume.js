var files = require('../files');


exports.init = function(add_page) {
  add_page(["resume", "_var"], "get", function(request, response, cookies, path) {
  	files.get_file("resume/"+path, response);
  });

  add_page(["resume"], "get", function(request, response, cookies, path) {
    files.get_file("resume/index.html", response);
  });
}