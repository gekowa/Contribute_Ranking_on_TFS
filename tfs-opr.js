var exec = require('child_process').exec,
    db = require('./db'),
    config = require('./config'),
    env = config.env,
    settings = config.settings;

var TfsCommandRunner = (function () {
    var threadLimit = 3,
        runningThreads = 0,
        queue = [],
        queueItem, 
        runTfsCommandInternal = function (cmd, callback) {
            console.log(cmd.replace(env.tf_exe, "tf")
                            .replace(/\/login:.+?\s/, "/login:*** ")
                            .replace(env.workspace_path, "/"));
            console.log("TF Queue: %d", queue.length);
            exec(cmd, function (error, stdout, stderr) {
                // see if we can run another command
                if (queueItem = queue.shift()) {
                    runTfsCommandInternal(queueItem.cmd, queueItem.callback);
                } else {
                    runningThreads -= 1;
                }

                if (error) {
                    // throw "TFS ERROR: " + error + "\nCommand: " + cmd;
                    console.error("TFS ERROR: " + error + "\nCommand: " + cmd);
                    return;
                }
                callback(stdout);
            });
        };

    return {
        run: function (cmd, callback) {
            if (runningThreads >= threadLimit) {
                queue.push({
                    "cmd": cmd,
                    "callback": callback
                });
            } else {
                runTfsCommandInternal(cmd, callback);
                runningThreads += 1;
            }
        }
    };
}());
// console.log(tf_hist_range_end_cmd);
// exec(tf_hist_range_end_cmd, function(error, stdout, stderr){
//  console.log('stdout: ' + stdout);
// });
/**
 * get changeset numbers
 * @param  {int}   from     from which changeset to start
 * @param  {Function} callback the callback takes a array parameter, that contains changeset
 * numbers available
 */
var getTfsChangesetsRange = function (from, callback) {
        var tf_range_begin_cmd = '"' + env.tf_exe + '" hist "' + env.workspace_path + '"' + ' /login:' + env.tfs_login + ' /recursive /sort:ascending /format:brief /noprompt ' + ' /stopafter:1',
            tf_range_end_cmd = '"' + env.tf_exe + '" hist "' + env.workspace_path + '"' + ' /login:' + env.tfs_login + ' /recursive /sort:descending /format:brief /noprompt ';

        if (from) {
            tf_range_end_cmd += " /version:C" + from + "~";
        }
        // if(end){
        //  tf_range_end_cmd += " /version:~C" + end;
        // }
        TfsCommandRunner.run(tf_range_end_cmd, function (stdout) {
            // parse
            var lineArr = stdout.split("\n"),
                i, line, cols, c, result = [];

            for (i = 2 /* ignore the first 2 lines */ ; i < lineArr.length; i++) {
                line = lineArr[i];
                cols = line.split(/\s+/);
                // result.push({
                //  "changeset" : cols[0],
                //  "user" : cols[1],
                //  "date" : cols[2]
                // });
                c = parseInt(cols[0].trim(), 10);
                if (c) {
                    result.push(c);
                }
            }
            console.log("%d changesets are counted!", result.length);
            if (callback && typeof callback === "function") {
                callback(result);
            }
        });
    };

/**
 * get changeset detail
 * @param  {int}   version  changeset #
 * @param  {Function} callback a function takes an object parameter, contains the detail of the
 * changeset
 * @return {[type]}            [description]
 */
var getTfsChangesetDetail = function (version, callback) {
        var tf_changeset_detail_cmd = '"' + env.tf_exe + '" hist "' + env.workspace_path + '"' + ' /login:' + env.tfs_login + ' /recursive /sort:descending /format:detailed /noprompt ' + '/stopafter:1 /version:~C' + version,
            partArr, part, lineArr, line, i, j, prefix, prefixMatch, user, date, comment = "",
            itemLines = [],
            action, actions = [],
            serverPath = "",
            items = {};
        // console.log("Changeset#%d queued!", version);
        TfsCommandRunner.run(tf_changeset_detail_cmd, function (stdout) {
            // parse
            // console.log(stdout);
            lineArr = stdout.split("\n");
            for (i = 0; i < lineArr.length; i += 1) {
                line = lineArr[i];
                if (line.match("Check-in Notes")) {
                    break;
                }
                prefixMatch = line.match(/^(\w+:)\s+/);
                if (prefixMatch && prefixMatch.length >= 2) {
                    prefix = prefixMatch[1];
                    line = line.replace(/^(\w+:)\s+/, "");
                }
                switch (prefix) {
                case "Changeset:":
                    prefix = "";
                    break;
                case "User:":
                    user = line.trim();
                    prefix = "";
                    break;
                case "Date:":
                    date = line.trim();
                    prefix = "";
                    break;
                case "Comment:":
                    line = line.trim();
                    if (line && line.length > 0) {
                        comment += line.replace(prefix, "");
                    }
                    break;
                case "Items:":
                    line = line.trim();
                    if (line && line.length > 0) {
                        line = line.replace(/;.*?$/m, "");
                        itemLines.push(line);
                    }
                    break;
                default:
                    break;
                }
            }

            // parse line action
            // items.length = itemLines.length;
            if (itemLines.length > 0) {
                for (i = 0; i < itemLines.length; i += 1) {
                    // merge, edit $Some Folder/Some Path/filename.js
                    line = itemLines[i];
                    partArr = line.split(/,+/);
                    actions = [];
                    for (j = 0; j < partArr.length; j += 1) {
                        part = partArr[j].trim();
                        if (part.match(/\$+/)) {
                            serverPath = part.match(/(\$.+)$/m)[1];
                            // action = part.match(/(\w+)\s+/)[1];
                            // actions.push(action);
                            // serverPath = part.replace(action, "").trim();
                            action = part.replace(serverPath, "").trim();
                            actions.push(action);
                            break;
                        } else {
                            actions.push(part);
                        }
                    }

                    // items["path"] = {
                    //     "actions": actions,
                    //     "path": serverPath
                    // });
                    items[serverPath] = {
                        "actions" : actions,
                        "detail" : {}
                    };
                }
            }

            if (callback && typeof callback === "function") {
                callback({
                    "changeset": version,
                    "user": user,
                    "date": date,
                    "comment": comment,
                    "items": items
                });
            }

            console.log("#:%s user:%s date:%s comment:%d items:%s", version, user, date, comment.length, items);
        });
    };


/**
 * get last changeset number for specific file
 * @param  {string}   path     server path to search for version
 * @param  {int}   version  the version number
 * @param  {Function} callback a function that takes 3 parameters, path, v1, v2
 * v1 should be the previous version
 */
var getTfsLastChangeset = function (path, version, callback) {
        // replace server path with file path
        var filePath = path.replace(env.mapped_server_path, env.workspace_path).replace("/", "\\"),
            tf_item_hist_cmd = '"' + env.tf_exe + '" hist "' + filePath + '"' + ' /login:' + env.tfs_login + ' /version:C' + version + ' /recursive /sort:descending /format:brief /noprompt /stopafter:2';

        TfsCommandRunner.run(tf_item_hist_cmd, function (stdout) {
            var lineArr = stdout.split("\n"),
                line4, v2, i, cols, c;

            if (lineArr.length >= 4) {
                line4 = lineArr[3];
                cols = line4.split(/\s+/);
                c = parseInt(cols[0].trim(), 10);
                if (c) {
                    v2 = c;
                }
            } else {
                v2 = version;
            }
            if (callback && typeof callback === "function") {
                callback(path, version, v2);
            }
        });
    };

/**
 * make a diff to see what happened to the specific file
 * @param  {string}   filePath
 * @param  {int}   v1
 * @param  {int}   v2
 * @param  {Function} callback a function that takes version and an object of modification detail
 * @return {[type]}            [description]
 */
var getTfsItemDiff = function (path, v1, v2, callback) {
        var filePath = path.replace(env.mapped_server_path, env.workspace_path).replace("/", "\\"),
            smallerVer, biggerVer, tf_item_diff_cmd = '"' + env.tf_exe + '" diff "' + filePath + '"' + ' /login:' + env.tfs_login + ' /ignorespace /ignoreeol /noprompt /format:unix /version:';
        if (v1 === v2) {
            return;
        }

        if (v1 == undefined || v2 == undefined) {
            return;
        }

        if (v1 > v2) {
            biggerVer = v1;
            smallerVer = v2;
        } else {
            biggerVer = v2;
            smallerVer = v1;
        }

        tf_item_diff_cmd += 'C' + smallerVer + '~C' + biggerVer;

        TfsCommandRunner.run(tf_item_diff_cmd, function (stdout) {
            var lineArr = stdout.split("\n"),
                i, line, m, n1, n2, result = {
                    "add": 0,
                    "change": 0,
                    "delete": 0
                };

            for (i = 2 /* ignore the first 2 lines */ ; i < lineArr.length; i++) {
                line = lineArr[i];
                // console.log(line);
                if (m = line.match(/^\d+a(\d+),(\d+)$/m)) {
                    // multi lines were added
                    n1 = parseInt(m[1], 10);
                    n2 = parseInt(m[2], 10);
                    result["add"] += Math.abs(n2 - n1 + 1);
                } else if (line.match(/^\d+a(\d+)$/m)) {
                    // one line was added
                    result["add"] += 1;
                } else if (m = line.match(/^(\d+),(\d+)d(\d+)$/m)) {
                    // multi lines were deleted
                    n1 = parseInt(m[1], 10);
                    n2 = parseInt(m[2], 10);
                    result["delete"] += Math.abs(n2 - n1 + 1);
                } else if (line.match(/^(\d+)d(\d+)$/m)) {
                    // one line were deleted
                    result["delete"] += 1;
                } else if (m = line.match(/c(\d+),(\d+)$/m)) {
                    // multi lines were changed 
                    n1 = parseInt(m[1], 10);
                    n2 = parseInt(m[2], 10);
                    result["change"] += Math.abs(n2 - n1 + 1);
                } else if (line.match(/c(\d+)$/m)) {
                    // one line were changed 
                    result["change"] += 1;
                }
            }

            console.log(result);

            if (callback && typeof callback === "function") {
                callback({
                    "changeset": biggerVer,
                    "path": path,
                    "detail": result
                });
            }
        });
    };

/**
 * for newly added files, no last path, let's see how many lines in the new file
 * @param  {[type]}   path     [description]
 * @param  {[type]}   v1       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var getTfsItemDiffForAdding = function(path, v1, callback){

};

module.exports = {
    analyzePhase1 : function(version){
        if(!version){
            version = settings.min_ver;
        }
        getTfsChangesetsRange(version, function (changesets) {
            var i, c;
            console.log("%d changesets are queued.", changesets.length);
            for (i = 0; i < changesets.length; i++) {
                c = changesets[i];
                if (c) {
                    getTfsChangesetDetail(c, function (changeset) {
                        // do sthg about the detail
                        // checkpoint -> save to db
                        db.saveChangeset(changeset);
                    });
                }
            }
        });
    },
    analyzePhase2 : function(force){
        db.getChangesets(function(cs){
            var i, c, path, item;
            for(i = 0; i<cs.length; i+=1){
                c = cs[i];

                for(path in c.items){
                    if(!c.items.hasOwnProperty(path)){
                        continue;
                    }
                    item = c.items[path];
                    if(force || item.detail.add == undefined){
                        // do diff from tfs
                        if(item.actions.indexOf('edit') != -1 || item.actions.indexOf('merge') != -1){
                            getTfsLastChangeset(path, c.changeset, function (path2, v1, v2) {
                                if (v1 !== v2) {
                                    getTfsItemDiff(path2, v1, v2, function (item) {
                                        db.saveChangesetItem(item);
                                    });
                                }
                            });
                        }
                    } 
                }
            }
        });
    }
};



// getTfsChangesetDetail(610);
// getTfsItemDiff("D:\\Workspace\\StaplesPPE3\\Main\\Source\\Navitor.StaplesPPE.Web.Public\\scripts\\src\\studio\\zindex-manager.js",
//     1000, 1241);