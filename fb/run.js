var facebook = require('./facebook.js');
var access_token = 'CAACEdEose0cBAKfkp4KMcFIfPsOaz1s03iA95kc6ZBdEZALn4rXz6hgFJxTfgGaMKVZAo0KM6mE4tMfZC28nioXkmqfVIj6qZA3Xy5PmzPBJ3MllACaKyV26koLq46HRgJqVUk0ilrnRMnXGYAmeCDi7F48XsOszwOHZAA0nYRUWG0UgZBLDApyU3yW9uJoJY0ZD';
facebook.getFbData(access_token, '/me/friends', function(data){
	friends = eval("("+data+")")["data"];
    friends.map(function(item) {
     	if (item["name"].indexOf("Ro") != -1){
     		console.log(item);
     	}
	});
});