var config = require('./config'),
    pointRules = config.point_rules,
    db = require('./db');

var calc = function(callback){
    db.getChangesets(function(cs){
        var i, j, fileType, path, item, c, ruleRegex, rule,
            point, ex = false,
            result = {};
        for(i = 0; i<cs.length; i+=1){
            c = cs[i];

            point = 0;
            for(path in c.items){
                if(!c.items.hasOwnProperty(path)){
                    continue;
                }
                item = c.items[path];
                fileType = path.match(/\.\w+$/m);
                if(fileType){
                    fileType = fileType.toString().toLowerCase();
                    rule = pointRules[fileType];
                    if(rule){
                        point += rule["item"][item.actions[0]] || 0;

                        ex = false;
                        for(j = 0; j<pointRules.excluded_files.length; j+=1){
                            if(path.indexOf(pointRules.excluded_files[j]) !== -1){
                                ex = true;
                            }
                        }

                        if(ex){
                            // console.log("Excluded: %s", path);
                            continue;
                        }
                        // line
                        point += 
                            rule["line"]["add"] * (item["detail"]["add"] || 0) +
                            rule["line"]["change"] * (item["detail"]["change"] || 0) +
                            rule["line"]["delete"] * (item["detail"]["delete"] || 0);

                        // console.log(point);
                    } else{
                        // console.log("unknown filetype: %s", fileType);
                    }
                }
            }

            if(!result[c.user]){
                result[c.user] = {
                    "point" : point,
                    "max" : point,
                    "max#" : c.changeset
                };
            } else{
                result[c.user].point += point;
                if(point > result[c.user].max){
                    result[c.user].max = point;
                    result[c.user]["max#"] = c.changeset;
                }
            }

        }

        // console.log(result);
        if(callback && typeof callback === 'function'){
            callback(result);
        }
    });
};

module.exports = {
    calc : calc
};