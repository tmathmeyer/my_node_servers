var sys = require('sys');
var exec = require('child_process').exec;

exports.init = function(add_page) {
  add_page(["gitstat", "_var", "_var", "_var"], "get", function(request, response, cookies, account, repo, date) {
    exec("git clone git://github.com/"+account+"/"+repo+".git /tmp/"+repo, function(){
      exec("/opt/gitinspector/gitinspector.py --since="+date+" /tmp/"+repo+"/", function(error, stdout, stderr){
        response.writeHead(200, {"Content-Type":"text/plain"});
        response.write(stdout+"");
        response.end();
        exec("rm -rf /tmp/"+repo, function(){});
      });
    });
  });

  add_page(["gitstat", "_var", "_var"], "get", function(request, response, cookies, account, repo) {
    exec("git clone git://github.com/"+account+"/"+repo+".git /tmp/"+repo, function(){
      exec("/opt/gitinspector/gitinspector.py /tmp/"+repo+"/", function(error, stdout, stderr){
        response.writeHead(200, {"Content-Type":"text/plain"});
        response.write(stdout+"");
        response.end();
        exec("rm -rf /tmp/"+repo, function(){});
      });
    });
  });

  add_page(["gitstat"], "get", function(request, response) {
    console.log("FAIL");

    response.writeHead(200, {"Content-Type":"text/plain"});
    response.write("if the github repo is github.com/tmathmeyer/nodeserver, your url should look like ../gitstat/tmathmeyer/nodeserver");
    response.end();
  });
}
