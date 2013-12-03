var sys = require('sys')
var exec = require('child_process').exec;

exports.init = function(add_page) {
  add_page(["gitstat", "_var", "_var"], "get", function(http_params, url_params) {
    exec_rando = function(error, stdout, stderr){}
    write_to_page = function(error, stdout, stderr){
      console.log(stdout);
    }

    console.log("FAIL");

    exec("cd /tmp", exec_rando);
    exec("git clone https://github.com/"+url_params[0]+"/"+url_params[1]);
    exec("cd "+url_params[0], exec_rando);
    exec("/opt/gitinspector/gitinspector.py ./", write_to_page);

    
  });

  add_page(["gitstat"], "get", function(http_params, url_params) {
    console.log("FAIL");

    response.writeHead(200, {"Content-Type":"text/plain"});
    response.write("FUCK");
    response.end();
  });
}