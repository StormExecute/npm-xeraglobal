const fs = require('fs')
const path = require('path')

module.exports.modify = modify
module.exports.undo = () => modify("isUndo")

function modify (undo) {
	
	if(!process.platform.startsWith("win")) throw new Error("Supported only Windows!")
	
	const NODE_NATIVE_PATH = path.join(process.execPath, "..")
	
	const NPM_NODE_MODULES_PATH = "\\node_modules\\npm\\"
	
	const NPM_NATIVE_PATH = NODE_NATIVE_PATH + NPM_NODE_MODULES_PATH
	
	const NPM_NATIVE_BIN_PATH = NPM_NATIVE_PATH + "bin\\"
	
	
	
	const NPM_APPDATA_PATH = process.env.APPDATA + "\\npm"
	
	const NPM_APPDATA_GLOBAL_PATH = NPM_APPDATA_PATH + NPM_NODE_MODULES_PATH + "bin\\npm-cli.js"
	
	
	global.NPM_CLI = !undo ? __dirname + "\\npm-cli-mod.js" : __dirname + "\\npm-cli-orig.js"
	
	
	
	_process(NPM_NATIVE_BIN_PATH + "npm-cli.js")
	
	if( fs.existsSync( NPM_APPDATA_GLOBAL_PATH ) ) _process(NPM_APPDATA_GLOBAL_PATH)
	
	
	
	console.log("Done!")
	
}

function _process (_path) {
	
	console.log("Starting modify " + _path)
	
	const NPM_CLI_DATA = fs.readFileSync(global.NPM_CLI).toString()
	
	try {
		
		fs.writeFileSync(_path, NPM_CLI_DATA, {flag: "w"})
		
	} catch(e) {
		
		if(e.code.includes("EPERM")) console.error("Run it as administrator!")
		else throw new Error(e)
		
	}
	
}