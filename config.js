module.exports = {
	"env" : {
		"tf_exe": "C:\\Program Files (x86)\\Microsoft Visual Studio 10.0\\Common7\\IDE\\tf.exe",
		"workspace_path" : "D:\\Workspace\\StaplesPPE3\\Main",
		"mapped_server_path" : "$/Staples PPE/Main",
		"tfs_login": ""	// need to add credential info that's need for running TF.exe
	},
	"settings":{
		"min_ver" : 116,
		"db_host" : "localhost",
		"db_port" : 27017,
		"db_name" : "cont-rank"
	},
	"point_rules":{
		"comment_min_length" : 5,
		"lack_comment" : -40,
		"excluded_files" : [
			"scripts/lib",
			"/build"
		],
		"excluded_users":[
			"GSkudlarick",
			"mlsmith",
			"bjpatel"
		],
		".cs" : {
			"item" :{
				"add" : 40,
				"edit" : 20,
				"merge" : 20,
				"rename" : 6,
				"source rename" : 6,
				"delete" : 0
			},
			"line" : {
				"add" : 10,
				"change" : 6,
				"delete" : 4
			}
		},
		".sql" : {
			"item" :{
				"add" : 40,
				"edit" : 20,
				"merge" : 20,
				"rename" : 6,
				"source rename" : 6,
				"delete" : 0
			},
			"line" : {
				"add" : 10,
				"change" : 6,
				"delete" : 4
			}
		},
		".js" : {
			"item" :{
				"add" : 40,
				"edit" : 20,
				"merge" : 20,
				"rename" : 6,
				"source rename" : 6,
				"delete" : 0
			},
			"line" : {
				"add" : 10,
				"change" : 6,
				"delete" : 4
			}
		},
		".css" : {
			"item" :{
				"add" : 16,
				"edit" : 8,
				"merge" : 8,
				"rename" : 3,
				"source rename" : 3,
				"delete" : 0
			},
			"line" : {
				"add" : 6,
				"change" : 2,
				"delete" : 1
			}
		},
		".html" : {
			"item" :{
				"add" : 16,
				"edit" : 8,
				"merge" : 8,
				"rename" : 3,
				"source rename" : 3,
				"delete" : 0
			},
			"line" : {
				"add" : 6,
				"change" : 2,
				"delete" : 1
			}
		},
		".aspx" : {
			"item" :{
				"add" : 16,
				"edit" : 8,
				"merge" : 8,
				"rename" : 3,
				"source rename" : 3,
				"delete" : 0
			},
			"line" : {
				"add" : 6,
				"change" : 2,
				"delete" : 1
			}
		},
		".ascx" : {
			"item" :{
				"add" : 16,
				"edit" : 8,
				"merge" : 8,
				"rename" : 3,
				"source rename" : 3,
				"delete" : 0
			},
			"line" : {
				"add" : 6,
				"change" : 2,
				"delete" : 1
			}
		},
		".master" : {
			"item" :{
				"add" : 16,
				"edit" : 8,
				"merge" : 8,
				"rename" : 3,
				"source rename" : 3,
				"delete" : 0
			},
			"line" : {
				"add" : 6,
				"change" : 2,
				"delete" : 1
			}
		},
		".cshtml" : {
			"item" :{
				"add" : 16,
				"edit" : 8,
				"merge" : 8,
				"rename" : 3,
				"source rename" : 3,
				"delete" : 0
			},
			"line" : {
				"add" : 6,
				"change" : 2,
				"delete" : 1
			}
		},
		".config" : {
			"item" :{
				"add" : 8,
				"edit" : 2,
				"merge" : 2,
				"rename" : 1,
				"source rename" : 1,
				"delete" : 0
			},
			"line" : {
				"add" : 1,
				"change" : 0,
				"delete" : 0
			}
		},
		".xsd" : {
			"item" :{
				"add" : 8,
				"edit" : 2,
				"merge" : 2,
				"rename" : 1,
				"source rename" : 1,
				"delete" : 0
			},
			"line" : {
				"add" : 1,
				"change" : 0,
				"delete" : 0
			}
		},
		".csproj" : {
			"item" :{
				"add" : 6,
				"edit" : 1,
				"merge" : 1,
				"rename" : 0,
				"source rename" : 0,
				"delete" : 0
			},
			"line" : {
				"add" : 1,
				"change" : 0,
				"delete" : 0
			}
		},
		".sln" : {
			"item" :{
				"add" : 6,
				"edit" : 1,
				"merge" : 1,
				"rename" : 0,
				"source rename" : 0,
				"delete" : 0
			},
			"line" : {
				"add" : 1,
				"change" : 0,
				"delete" : 0
			}
		},
		".user" : {
			"item" :{
				"add" : -50,
				"edit" : -60,
				"merge" : -50,
				"rename" : -50,
				"source rename" : 0,
				"delete" : 50
			},
			"line" : {
				"add" : 1,
				"change" : 0,
				"delete" : 0
			}
		}
	}
};