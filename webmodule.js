modules = 
[
	{
		"name" : "Paste Server",
		"location" : "./paste/paste"
	},
	{
		"name" : "Login",
		"location" : "./login/login"
	},
	{
		"name" : "Image",
		"location" : "./img/image"
	},
	{
		"name" : "Echo",
		"location" : "./echo/echo"
	}
];

var pages = {};

exports.init = function() {
	modules.forEach(function(data){
		console.log("the "+data.name+" module has been loaded");
		require(data.location).init(addPage);
		console.log(" ");
	});
	//console.log(JSON.stringify(pages, null, 2));
}

exports.viewPage = function(url, type, params) {
	return viewPage(url, type, params, pages, []);
}

viewPage = function(url, type, params, tree, vars) {
	if (typeof tree === 'undefined') {
		viewPage(url, type, params, pages);
	} else if (url.length == 0) {
		tree[type](params, vars);
		return true;
	} else {
		for(var node in tree) {
			var obj = !(typeof tree[node] === 'function');
			var same = match(url[0], node);
			if (obj && same) {
				if (node == "_var") {
					var i = vars.length;
					vars[i] = url[0];
				}
				var found = viewPage(url.slice(1), type, params, tree[node],vars);
				if (found) return found;
			}
		}
		return false;
	}

}






addPage = function(url_params, type, page) {
	console.log("  =>"+url_params);
	nest = pages;
	url_params.forEach(function(data){
		if (typeof nest[data] === 'undefined') {
			nest[data] = {};
		}
		nest = nest[data];
	});
	if (type == "get") {
		nest._get = page;
	} else if (type == "post") {
		nest._post = page;
	}
}


match = function(a, b) {
	return a==b || a=="_var" || b == "_var";
}