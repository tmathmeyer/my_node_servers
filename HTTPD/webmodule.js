mods = 
[
	{
		"name" : "Paste Server",
		"location" : "./paste/paste"
	},
	{
		"name" : "Login Testing",
		"location" : "./login/login"
	}
];


exports.read = function() {
	modules = {};
	mods.forEach(function(data){
		modules = require(data.location).addFunctions(modules);
		console.log("the "+data.name+" module has been loaded");
	});
	return modules;
}
