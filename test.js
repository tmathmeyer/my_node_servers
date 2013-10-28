var pages = {};

exports.addPage = function(url, type, page_func) {
	addPage(url.split("/"), type, page_func);
}


addPage = function(url_params, type, page) {
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

exports.viewPage = function(url, type, params, tree) {
	if (typeof tree === 'undefined') {
		viewPage(url, type, params, pages);
	} else if (url.length == 0) {
		console.log(tree[type](params));
		return true;
	} else {
		for(var node in tree) {
			var obj = !(typeof tree[node] === 'function');
			var same = match(url[0], node);
			console.log("checking: "+ node + "   type: "+obj+"   same: "+same + "    count: "+url.length);
			if (obj && same) {
				var found = viewPage(url.slice(1), type, params, tree[node]);
				if (found) return found;
			}
		}
		return false;
	}
}

match = function(a, b) {
	return a==b || a=="_var" || b == "_var";
}