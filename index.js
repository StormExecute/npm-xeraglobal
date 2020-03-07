const fs = require('fs')
const path = require('path')

module.exports.modify = modify
module.exports.undo = () => modify("isUndo")

function modify (undo) {
	
	if(!process.platform.startsWith("win")) throw new Error("Supported only Windows!")
		
	global.tasks = {
		
		"NATIVE": false,
		
		"GLOBAL": false
		
	};
	
	const NODE_NATIVE_PATH = path.join(process.execPath, "..")
	
	const NPM_NODE_MODULES_PATH = "\\node_modules\\npm\\"
	
	const NPM_NATIVE_PATH = NODE_NATIVE_PATH + NPM_NODE_MODULES_PATH
	
	const NPM_NATIVE_BIN_PATH = NPM_NATIVE_PATH + "bin\\"
	
	
	
	const NPM_APPDATA_PATH = process.env.APPDATA + "\\npm"
	
	const NPM_APPDATA_GLOBAL_PATH = NPM_APPDATA_PATH + NPM_NODE_MODULES_PATH + "bin\\npm-cli.js"
	
	const NPM_GLOBAL_PATH_BY_ARGV = process.argv[1] ? path.join(process.argv[1], "../../../npm/bin/npm-cli.js") : false
	
	
	
	global.NPM_CLI = !undo ? path.join(__dirname, 'npm-cli-mod.js') : path.join(__dirname, 'npm-cli-orig.js')
	
	
	
	if( fs.existsSync( NPM_NATIVE_BIN_PATH ) ) _process(NPM_NATIVE_BIN_PATH + "npm-cli.js", "NATIVE")
	
	if( fs.existsSync( NPM_APPDATA_GLOBAL_PATH ) ) _process(NPM_APPDATA_GLOBAL_PATH, "GLOBAL")
		
	if( !global.tasks.GLOBAL && NPM_GLOBAL_PATH_BY_ARGV && fs.existsSync( NPM_GLOBAL_PATH_BY_ARGV ) ) _process(NPM_GLOBAL_PATH_BY_ARGV, "GLOBAL")
	
	
	
	if(!global.tasks.NATIVE) {
		
		console.error("\n Error! Npm native path not found!")
		
	}
	
	if(!global.tasks.GLOBAL) {
		
		console.error("\n Error! Npm global path not found!")
		
	}
	
	console.log("\n Done!")
	
}

function _process (_path, task) {
	
	console.log("\n Starting modify " + _path)
	
	const NPM_CLI_DATA = fs.readFileSync(global.NPM_CLI).toString()
	
	try {
		
		fs.writeFileSync(_path, NPM_CLI_DATA, {flag: "w"})
		
		global.tasks[task] = true
		
	} catch(e) {
		
		if(e.code.includes("EPERM")) throw new Error("Run it as administrator!")
		else throw new Error(e)
		
	}
	
}