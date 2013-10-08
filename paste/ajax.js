function savePaste() {
	var text = $('textarea#paste').val();
	$.post( "paste/test.html", {"paste":text}, function( data ) {
		window.location = data;
	});
}
