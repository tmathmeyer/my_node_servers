function savePaste() {
	var text = $('textarea#paste').val();
	$.post( "paste/post/content", {"paste":text}, function( data ) {
		window.location = data;
	});
}
