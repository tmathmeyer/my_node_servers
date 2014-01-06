var mongo = require('./mongo');
var fql   = require('fql');
var queryURL = "https://graph.facebook.com//fql?q=SELECT+uid,+online_presence+FROM+user+WHERE+uid+IN+(SELECT+uid2+FROM+friend+where+uid1+=+me())&access_token=";
var https = require('https');

getAll = function(){
    
    var unlock = 0;

    mongo.users.find().forEach(function(err, doc) {
        if (!doc) {
            if(!unlock){
                process.exit(0);
            }
            return;
        }
        
        unlock++;

        https.get(queryURL+doc.access_token, function(data){
            var info = "";
            data.on('data', function(chunk) {
                info+=chunk;
            });

            data.on('end', function(){
                content = JSON.parse(info);

                content.data.forEach(function(user){
                    var time = Math.round(new Date().getTime()/(60000));
                    var bit = -1;
                    
                    if (user.online_presence == 'active'){
                        bit = 1;
                    } else if (user.online_presence == 'idle'){
                        bit = 0;
                    }

                    var list_data = {"time":time, "status":bit};

                    mongo.accounts.update({id:""+user.uid}, {$push: {"online": list_data}}, function(err){
                        if (err){
                            console.log(err);
                        }
                    });
                });

                unlock --;
                if (unlock == 0){
                    process.exit(0);
                }
            });
        });
    })
}

getAll();
