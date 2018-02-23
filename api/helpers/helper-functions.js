exports.password_generator = () => {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!?=#*$@+-.";
	var string_length = 8;
	var randomString = '';
	for (var i=0; i<string_length; i++) {
		var randomNumber = Math.floor(Math.random() * chars.length);
		randomString += chars.substring(randomNumber,randomNumber+1);
	}
	return randomString;
}