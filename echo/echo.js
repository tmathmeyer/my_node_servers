exports.init = function(add_page) {
  add_page(["echo", "_var"], "get", function(http_params, url_params) {
    http_params[1].writeHead(200, {"Content-Type": "text/html"});
    http_params[1].end(url_params[0]+"");
    console.log(url_params);
  });
}