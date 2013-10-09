var redis = require("redis");

exports.put = function(client, key, obj) {
    client.hset(key+'', 'data', JSON.stringify(obj), function(err, data) {
        if(err) {
            console.log(error);
        }
    });
}

exports.get = function(client, key, callback) {
    client.hget(key+'', 'data', function(err, data) {
        if(err) {
            console.log(err);
        } else {
            if(data == null) {
                callback(null)
            } else {
                callback(data);
            }
        }
    });
}
