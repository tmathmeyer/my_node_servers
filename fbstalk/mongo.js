var databaseURI = "localhost:27017/chatgraph";
var collections = ["users", "accounts"];
var db = require("mongojs").connect(databaseURI, collections);

module.exports = db;
