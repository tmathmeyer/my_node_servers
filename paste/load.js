function loadPaste() {
	var text = $('textarea#paste').val();
	$.get( "/paste/p" + window.location.pathname.substring(6), function( data ) {
		console.log("/paste/p" + window.location.pathname.substring(6));
		console.log(data);
		var data = replaceAll("\\\\t", "&#09;", replaceAll("\\\\n", "<br>", replaceAll("\\\\\"", "\"", data)));
		document.getElementById('paste_data').innerHTML = "<pre>"+data.substring(0, data.length - 1).substring(1)+"</pre>";

		var $content = $("#paste_data");
		$content.syntaxHighlight();



	});
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}