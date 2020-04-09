const fs = require('fs')
const path = require('path')
const readline = require('readline');

module.exports.modify = modify
module.exports.undo = () => modify("isUndo")

function modify (undo) {
	
	if(!process.platform.startsWith("win") && !process.platform.includes("linux")) throw new Error("Supported only Windows and Linux!")
	
	
	global.NPM_CLI = !undo ? path.join(__dirname, 'npm-cli-mod.js') : path.join(__dirname, 'npm-cli-orig.js')
	
	
	let showDone = 1
	
	
	if(process.platform.startsWith("win")) {
		
		//FOR WINDOWS
		
		global.windowsTasks = {
		
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
	
		

		if( fs.existsSync( NPM_NATIVE_BIN_PATH ) ) _process(NPM_NATIVE_BIN_PATH + "npm-cli.js", "NATIVE")

		if( fs.existsSync( NPM_APPDATA_GLOBAL_PATH ) ) _process(NPM_APPDATA_GLOBAL_PATH, "GLOBAL")

		if( !global.windowsTasks.GLOBAL && NPM_GLOBAL_PATH_BY_ARGV && fs.existsSync( NPM_GLOBAL_PATH_BY_ARGV ) ) _process(NPM_GLOBAL_PATH_BY_ARGV, "GLOBAL")



		if(!global.windowsTasks.NATIVE) {

			console.error("\n Error! Npm native path not found!")

		}

		if(!global.windowsTasks.GLOBAL) {

			console.error("\n Error! Npm global path not found!")

		}
		
	} else if (process.platform.includes("linux") && process.execPath.includes(".nvm")) {
		
		 //FOR LINUX NVM (Node Version Manager)
		
		if(!process.env.SUDO_USER) throw new Error("Run it as sudo!")
		
		showDone = 0
		
		const rl = readline.createInterface({
			
			input: process.stdin,
			output: process.stdout
			
		})

		rl.question('Type 1, if you want to modify all nvm nodes\n', answer => {
			
			const nvmVersionsFolder = "/home/" + process.env.SUDO_USER + "/.nvm/versions/node/";
			
			const standartPathToNpmCli = "/lib/node_modules/npm/bin/npm-cli.js";
			
			if(answer == "1") {
				
				const isDirectory = source => fs.lstatSync(source).isDirectory()

				const getDirectories = source =>
				  fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
				
				getDirectories(nvmVersionsFolder).forEach(nodeFolder => {
					
					_process(nodeFolder + standartPathToNpmCli);
					
				});
				
			} else {
				
				_process(nvmVersionsFolder + "v" + process.versions.node + standartPathToNpmCli)
				
			}

			rl.close();
			
			console.log("\n Done!")
			
		});
		
	} else if(process.platform.includes("linux")) {
		
		 //FOR LINUX NODE
		
		if(!process.env.SUDO_USER) throw new Error("Run it as sudo!")
		
		_process("/usr/lib/node_modules/npm/bin/npm-cli.js")
		
	}
	
	if(showDone) console.log("\n Done!")
	
}

function _process (_path, task) {
	
	console.log("\n Starting modify " + _path)
	
	const NPM_CLI_DATA = fs.readFileSync(global.NPM_CLI).toString()
	
	try {
		
		fs.writeFileSync(_path, NPM_CLI_DATA, {flag: "w"})
		
		if(task && global.windowsTasks) global.windowsTasks[task] = true
		
	} catch(e) {
		
		if(e.code.includes("EPERM") || e.code.includes("EACCES")) throw new Error("Run it as administrator!")
		else throw new Error(e)
		
	}
	
}