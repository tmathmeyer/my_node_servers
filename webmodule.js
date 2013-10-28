modules = 
[
	{
		"name" : "Paste Server",
		"location" : "./paste/paste"
		"top_level_url" : "paste"
	}
	//{
	//	"name" : "Login",
	//	"location" : "./login/login"
	//},
	//{
	//	"name" : "Image",
	//	"location" : "./img/image"
	//}
];


exports.init = function() {
	functions = {};
	modules.forEach(function(data){
		functions[data.top_level_url] = {};
		require(data.location).init(functions[data.top_level_url]);
		console.log("the "+data.name+" module has been loaded");
	});
	return functions;
}
