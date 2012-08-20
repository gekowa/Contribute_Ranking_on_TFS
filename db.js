var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    config = require('./config'),
    settings = config.settings;


var prepare = function(callback){
    var server = new Server(settings.db_host, settings.db_port, {
        auto_reconnect: true
    });
    var db = new Db(settings.db_name, server);

    db.open(function (err, db) {
        if(!err){
            if(callback && typeof callback === "function"){
                callback(db);
            }
        }
    });
};

var saveChangeset = function(changeset, callback){
    prepare(function(db){
        db.collection("changeset", function(err, collection){
            changeset["_id"] = changeset.changeset;

            collection.update({"_id" : changeset.changeset }, 
                changeset, {
                    upsert: true
                }, function(err){
                    if(!err){
                        db.close();
                        if(callback && typeof callback === "function"){
                            callback(changeset);
                        }
                    }
                }
            );
        });
    });
};

var saveChangesetItem = function(item){
    prepare(function(db){
        db.collection("changeset", function(err, collection){
            // collection.update({
            //     _id : item.changeset,
            //     "items.path" : item.path
            // }, 
            // /* update */
            // {
            //     $set : { "items.$.detail" : item.detail }
            // }, 
            // /* options*/
            // {
            //     // upsert: true
            // }, function(err, doc){
            //     if(!err){
            //         db.close();
            //     }
            // });
            collection.findOne({"_id" : item.changeset}, {}, function(err, doc){
                if(!err){
                    doc.items[item.path]["detail"] = item.detail;

                    collection.save(doc, {}, function(err){
                        if(!err){
                            db.close();
                        }
                    });
                }
            });
            
        });
    });
};

var getChangesets = function(callback){
    prepare(function(db){
        db.collection("changeset", function(err, collection){
            collection.find().toArray(function(err, docs){
                if(!err){
                    db.close();
                    if(callback && typeof callback === "function"){
                        callback(docs);
                    }
                }
            });
        });
    });
};

var getLatestChangeset = function(callback){
    prepare(function(db){
        db.collection("changeset", function(err, collection){
            collection.findOne({}, 
                {"changeset" : 1}, 
                {
                    sort : {"changeset" : -1},
                    limit: 1
                },
                function(err, doc){
                    if(!err){
                        db.close();
                        console.log(doc);
                        if(callback && typeof callback === "function"){
                            callback(doc);
                        }
                    }
                }
            );
        });
    });
};


module.exports = {
    saveChangeset : saveChangeset,
    saveChangesetItem : saveChangesetItem,
    getChangesets : getChangesets,
    getLatestChangeset : getLatestChangeset
};