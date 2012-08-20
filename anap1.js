var tfs = require('./tfs-opr'),
	db = require('./db');

// get the latest version
db.getLatestChangeset(function(c){
	var changeset = c.changeset;
	tfs.analyzePhase1(changeset);
});