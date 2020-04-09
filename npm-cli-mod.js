#!/usr/bin/env node

;(function () { // wrapper in case we're in module_context mode
	// windows: running "npm blah" in this folder will invoke WSH, not node.
	/* global WScript */
	
	if (typeof WScript !== 'undefined') {
		
		WScript.echo(
		  'npm does not work when run\n' +
			'with the Windows Scripting Host\n\n' +
			"'cd' to a different directory,\n" +
			"or type 'npm.cmd <args>',\n" +
			"or type 'node npm <args>'."
		)
		WScript.quit(1)
		
		return true
		
	}

	process.title = 'npm'

	const unsupported = require('../lib/utils/unsupported.js')
	unsupported.checkForBrokenNode()

	const log = require('npmlog')
	log.pause() // will be unpaused when config is loaded.
	log.info('it worked if it ends with', 'ok')

	unsupported.checkForUnsupportedNode()

	const npm = require('../lib/npm.js')
	const npmconf = require('../lib/config/core.js')
	const errorHandler = require('../lib/utils/error-handler.js')

	const configDefs = npmconf.defs
	const shorthands = configDefs.shorthands
	const types = configDefs.types
	const nopt = require('nopt')
	
	const fs = require('fs')
	const path = require('path')
	const rimraf = require('rimraf')
	
	// if npm is called as "npmg" or "npm_g", then
	// run in global mode.
	
	if (process.argv[1][process.argv[1].length - 1] === 'g') {
		
		process.argv.splice(1, 1, 'npm', '-g')
		
	}
	
	
	const isGlobalArgvOriginal = !!process.argv.filter(el => el == "-g" || el == "--global").length
	
	
	const xerUpArgv = ["xerup", "upxer", "upp", "uppackages"];
	
	const npmArgs = process.argv.slice(2)
	
	var isXerUp = xerUpArgv.indexOf(npmArgs[0]) !== -1
	
	var XerUpArgv = []
	
	if(isXerUp) XerUpArgv = npmArgs.slice(1)
		
	if(!XerUpArgv.length) isXerUp = false
	
	if(isXerUp) process.argv.splice(2, 0, "i")
		
	
	
	const xerArgv = ["x", "xer", "xera", "хер", "хуй"];
			
	const parsedXerArgv = xerArgv.map(arg => arg = "-" + arg).concat( xerArgv.map(arg => arg = "--" + arg) )
	
	const isXerInstalling = !!(process.argv.filter(el => parsedXerArgv.indexOf(el) !== -1).length && !isXerUp)
	
	
	
	var SaveArgv = 0, SaveDevArgv = 0, DeleteTrash = 0
	
	
	
	if(isXerInstalling && !isGlobalArgvOriginal) {
		
		process.argv.push("-g")
		
	}
	
	
	if(isXerInstalling || isXerUp) {
		
		SaveArgv = process.argv.filter(el => el == "-S" || el == "--save").length
		
		SaveDevArgv = process.argv.filter(el => el == "-D" || el == "--save-dev").length
		
		DeleteTrash = process.argv.filter(el => el == "-dt" || el == "--delete-trash").length
		
		if(isXerUp && DeleteTrash) throw new Error("npm xerup conflicts with flag --delete-trash");
		
		if(isXerUp) XerUpArgv = XerUpArgv.filter(el => el != "-S" && el != "--save" && el != "-D" && el != "--save-dev")
		
	}
	
	

	log.verbose('cli', process.argv)

	const conf = nopt(types, shorthands)
	npm.argv = conf.argv.remain
	
	if (npm.deref(npm.argv[0])) npm.command = npm.argv.shift()
	else conf.usage = true

	if (conf.version) {
		
		console.log(npm.version)
		
		return errorHandler.exit(0)
		
	}

	if (conf.versions) {
		
		npm.command = 'version'
		
		conf.usage = false
		
		npm.argv = []
		
	}

	log.info('using', 'npm@%s', npm.version)
	log.info('using', 'node@%s', process.version)

	process.on('uncaughtException', errorHandler)
	process.on('unhandledRejection', errorHandler)

	if (conf.usage && npm.command !== 'help') {
		
		npm.argv.unshift(npm.command)
		
		npm.command = 'help'
		
	}

	var isGlobalNpmUpdate = conf.global && ['install', 'update'].includes(npm.command) && npm.argv.includes('npm')

	// now actually fire up npm and run the command.
	// this is how to use npm programmatically:
	conf._exit = true
	
	class NPM_CLI_MOD {
		
		checkUpdates() {
			
			if (
				!isGlobalNpmUpdate &&
				npm.config.get('update-notifier') &&
				!unsupported.checkVersion(process.version).unsupported
			) {
				
				const pkg = require('../package.json')
				let notifier = require('update-notifier')({pkg})
				const isCI = require('ci-info').isCI
				
				if (
					notifier.update &&
					notifier.update.latest !== pkg.version &&
					!isCI
				) {
					
					const color = require('ansicolors')
					const useColor = npm.config.get('color')
					const useUnicode = npm.config.get('unicode')
					const old = notifier.update.current
					const latest = notifier.update.latest
					
					let type = notifier.update.type
					
					if (useColor) {
						switch (type) {
							case 'major':
							  type = color.red(type)
							  break
							case 'minor':
							  type = color.yellow(type)
							  break
							case 'patch':
							  type = color.green(type)
							  break
						}
					}
					
					const changelog = `https://github.com/npm/cli/releases/tag/v${latest}`
					notifier.notify({
						message: `New ${type} version of ${pkg.name} available! ${
						useColor ? color.red(old) : old
						} ${useUnicode ? '→' : '->'} ${
						useColor ? color.green(latest) : latest
						}\n` +
						`${
						useColor ? color.yellow('Changelog:') : 'Changelog:'
						} ${
						useColor ? color.cyan(changelog) : changelog
						}\n` +
						`Run ${
						useColor
						  ? color.green(`npm install -g ${pkg.name}`)
						  : `npm i -g ${pkg.name}`
						} to update!`
					})
				}
			}
			
		}
		
		copyFileSync( source, target ) {

            var targetFile = target;

            //if target is a directory a new file with the same name will be created
            if ( fs.existsSync( target ) ) {
                if ( fs.lstatSync( target ).isDirectory() ) {
                    targetFile = path.join( target, path.basename( source ) );
                }
            }

            fs.writeFileSync(targetFile, fs.readFileSync(source));
			
        }
		
		copyFolderRecursiveSync( source, target ) {
			
			const _self = this
			
            var files = [];

            //check if folder needs to be created or integrated
            var targetFolder = path.join( target, path.basename( source ) );
            if ( !fs.existsSync( targetFolder ) ) {
                fs.mkdirSync( targetFolder );
            }

            //copy
            if ( fs.lstatSync( source ).isDirectory() ) {
                files = fs.readdirSync( source );
                files.forEach( function ( file ) {
                    var curSource = path.join( source, file );
                    if ( fs.lstatSync( curSource ).isDirectory() ) {
                        _self.copyFolderRecursiveSync( curSource, targetFolder );
                    } else {
                        _self.copyFileSync( curSource, targetFolder );
                    }
                } );
            }
			
        }
		
		convertBackSlash(str) {
			
			if(process.platform.startsWith("win")) return str;
			
			return str = str
				.replace(/\\\\/gmi, "/")
				.replace(/\\/gmi, "/")
			
		}
		
		writeAndParsePackageSync(path) {
			
			return JSON.parse(fs.readFileSync(path).toString())
			
		}
		
		bCRRemove() {

			console.log("\n Removing from " + this.globalXerPath)
			
			npm.argv[0] = this.realInstallingModuleName

			let itWasRealDeleting = false;

			if( fs.existsSync( this.xerMainModulePath ) ) {

				itWasRealDeleting = true;

				rimraf.sync(this.realRemovingModulePath ? this.realRemovingModulePath : this.xerMainModulePath)
				
				if(fs.existsSync(this.projectPkgPath)) {

					const projectPackage = this.writeAndParsePackageSync(this.projectPkgPath)
					
					const _self = this;
					
					["dependencies", "devDependencies"].forEach(dep => {
						
						if(projectPackage[dep]) {
							
							if(projectPackage[dep][_self.realInstallingModuleName]) {
								
								delete projectPackage[dep][_self.realInstallingModuleName]
								
							}
							
						}
						
					})

					fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
				
				}

			}
			
			/* if(itWasRealDeleting) {
				
				const globarDirPkg = this.writeAndParsePackageSync(this.globalDirPkgPath)
			
				if(!globarDirPkg.bin) {
					
					console.log("\n Also was removed " + this.globalDirModulePath)
					
					this.deleteFolderRecursive(this.globalDirModulePath)
					
				}
			
			} */

			if(itWasRealDeleting) console.log("\n Done!\n")
			else console.error("\n Nothing happened (the module being deleted does not exist)!\n")

			//return errorHandler(null)
			
		}
		
		extraWritePkg(projectPackage) {
			
			fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
				
			console.log("\n Done!")
			
			return errorHandler(null)
			
		}
		
		getProjectPkg(checkDep) {
			
			var projectPackage = this.writeAndParsePackageSync(this.projectPkgPath)
			
			if(checkDep && !(projectPackage.dependencies || projectPackage.devDependencies)) return projectPackage
		
			for(let prop in this.defaultPkgJSONIfNotExists) {
								  
				if(!projectPackage[prop]) {
					
					let defaultProp = Object.prototype.toString.call(this.defaultPkgJSONIfNotExists[prop]) === '[object Object]' ?
									  Object.assign({}, this.defaultPkgJSONIfNotExists[prop])
									  :
									  Array.isArray(this.defaultPkgJSONIfNotExists[prop])
									  ?
									  Object.assign([], this.defaultPkgJSONIfNotExists[prop])
									  :
									  this.defaultPkgJSONIfNotExists[prop]
					
					projectPackage[prop] = defaultProp 
					
				}
				
			}
			
			return projectPackage
			
		}
		
		xerUp() {
			
			console.log("\n Starting updating of package.json!")
			
			const dependencyName = this.SaveDevArgv && !this.SaveArgv ? "devDependencies" : "dependencies"
			
			const oppositeDependencyName = (dependencyName == "dependencies" ? "devDependencies" : dependencyName == "devDependencies" ? "dependencies" : "null")
			
			var projectPackage = {}
			
			if(!fs.existsSync(this.projectPkgPath)) projectPackage = Object.assign({}, this.defaultPkgJSONIfNotExists)
			else projectPackage = this.getProjectPkg()
			
			if(!projectPackage[dependencyName]) projectPackage[dependencyName] = {} //not necessary
			
			var isRemovingDependencies = false
			
			if(this.xerUpDeleteCommands.indexOf(this.XerUpArgv[0]) !== -1) {
				
				this.XerUpArgv = this.XerUpArgv.slice(1)
				
				isRemovingDependencies = true
				
			}
			
			if(this.xerUpReverseCommands.indexOf(this.XerUpArgv[0]) !== -1) {
				
				let dependencies = Object.assign({}, projectPackage.dependencies)
				let devDependencies = Object.assign({}, projectPackage.devDependencies)
				
				projectPackage.dependencies = devDependencies
				projectPackage.devDependencies = dependencies
				
				return this.extraWritePkg(projectPackage)
				
			}
			
			if(this.xerUpSortCommands.indexOf(this.XerUpArgv[0]) !== -1) {
				
				["dependencies", "devDependencies"].forEach(dep => {
					
					projectPackage["_" + dep] = Object.assign({}, projectPackage[dep])
					
					let sort = Object.keys(projectPackage[dep]).sort((a, b) => {
						let x = a.toLowerCase()
						let y = b.toLowerCase()
						return x < y ? -1 : x > y ? 1 : 0;
					})
					
					projectPackage[dep] = {}
					
					for(let s of sort) {
						
						projectPackage[dep][s] = projectPackage["_" + dep][s]
						
					}
					
					delete projectPackage["_" + dep]
					
				})
				
				return this.extraWritePkg(projectPackage)
				
			}
			
			let itWasReal = false
			
			for(let i = 0; i < this.XerUpArgv.length; i++) {
				
				let pkgName = this.XerUpArgv[i]
				
				if(!pkgName) continue
				
				itWasReal = true
				
				if(isRemovingDependencies) {
					
					delete projectPackage[dependencyName][pkgName]
					
					continue
					
				}
				
				let thXerPackagePath = this.convertBackSlash(this.globalXerPath + "\\" + pkgName)
				
				if(!fs.existsSync(thXerPackagePath)) {
					
					console.error("\n The module " + pkgName + " not found in " + this.globalXerPath)
					
					continue
					
				}
				
				const thXerPackage = this.writeAndParsePackageSync(this.convertBackSlash(thXerPackagePath + "\\package.json"))
				
				projectPackage[dependencyName][pkgName] = "^" + thXerPackage.version
				
				if(projectPackage[oppositeDependencyName]) {
					
					if(projectPackage[oppositeDependencyName][pkgName]) {
						
						delete projectPackage[oppositeDependencyName][pkgName]
						
					}
					
				}
				
			}
			
			fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
			
			if(itWasReal) console.log("\n Done!")
			else console.error("\n Nothing happened!")
			
			return errorHandler(null)
			
		}
		
		beforeDefinePaths() {
			
			this.globalXerPath = (process.env.USERPROFILE || ( process.env.SUDO_USER ? "\\home\\" + process.env.SUDO_USER : process.env.HOME ) ) + "\\.node_modules";
			
			let npmArgv = npm.argv[0]
			
			if(npmArgv) {
				
				if(npmArgv.split("@").length == 3) {
					
					let origNpmArgv = npmArgv
					
					npmArgv = origNpmArgv.split("/")[0]
					
					this.realInstallingModuleName = "@" + origNpmArgv.split("@")[1]
					
					this.realRemovingModulePath = this.globalXerPath + "\\" + this.realInstallingModuleName
					
				} else if(npmArgv.startsWith("@")) {
					
					let origNpmArgv = npmArgv
					
					npmArgv = origNpmArgv.split("/")[0]
					
					this.realRemovingModulePath = this.globalXerPath + "\\" + origNpmArgv
					
				} else if(npmArgv.includes("@") && !npmArgv.startsWith("@")) {
					
					npmArgv = npmArgv.split("@")[0]
					
					this.realInstallingModuleName = npmArgv
					
				}
				
			}
			
			this.installingModuleName = npmArgv
			
			if(!this.realInstallingModuleName) this.realInstallingModuleName = npm.argv[0]
			
			this.globalDirModulePath = this.GLOBAL_DIR + "\\" + this.installingModuleName //он шиндоус ту бэкслэш воркс бат он линукс ит дасэнт, \usr\lib\node_modules\\module
			
			this.globalDirRealModulePath = this.GLOBAL_DIR + "\\" + this.realInstallingModuleName
							 
			this.globalDirPkgPath = this.globalDirModulePath + "\\package.json"
			
			this.globalDirRealPkgPath = this.globalDirRealModulePath + "\\package.json"
			
			this.projectPkgPath = npm.localPrefix + "\\package.json"
			
			this.xerMainModulePath = this.globalXerPath + "\\" + this.installingModuleName
			
			this.xerMainRealModulePath = this.globalXerPath + "\\" + this.realInstallingModuleName
			
			this.xerMainModulePackagePath = this.xerMainModulePath + "\\package.json"
			
			this.xerMainRealModulePackagePath = this.xerMainRealModulePath + "\\package.json";
			
			if(process.platform.includes("linux")) {
			
				[

					"GLOBAL_DIR",
					"realRemovingModulePath", 
					"globalXerPath",
					"installingModuleName",
					"realInstallingModuleName",
					"globalDirModulePath",
					"globalDirRealModulePath",
					"globalDirPkgPath",
					"globalDirRealPkgPath",
					"projectPkgPath",
					"xerMainModulePath",
					"xerMainRealModulePath",
					"xerMainModulePackagePath",
					"xerMainRealModulePackagePath",

				].forEach(function(el) {

					if(!this[el]) return

					this[el] = this.convertBackSlash(this[el]);

				}.bind(this));
				
			}
			
			//console.log(this.xerMainModulePath, this.installingModuleName, this.realInstallingModuleName, this.realRemovingModulePath, npm.argv[0])
			
			//errorHandler(null)
			
		}
		
		backupPkg() {
			
			const _self = this;
			
			var projectPackage = this.getProjectPkg(true)
			
			_self.isUsuallyRemoving = null;
			
			["dependencies", "devDependencies"].forEach(dep => {
				
				if(!projectPackage[dep]) return;
				
				if(!_self.isUsuallyRemoving) _self.isUsuallyRemoving = {}
				
				_self.isUsuallyRemoving[dep] = Object.assign({}, projectPackage[dep])
				
				for(let dependency in _self.isUsuallyRemoving[dep]) {
					
					if(dependency == _self.realInstallingModuleName) delete _self.isUsuallyRemoving[dep][dependency]
					
				}
				
				delete projectPackage[dep]
				
			})
			
			if(_self.isUsuallyRemoving) fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
			else {
				
				this.originalPkg = fs.readFileSync(this.projectPkgPath).toString()
				
				this.tempPkgLockCfg = npm.config.get("package-lock")
				
				npm.config.set("package-lock", false)
				
			}
			
		}
		
		restorePkg() {
			
			const _self = this;
			
			var projectPackage = this.getProjectPkg();
			
			if(this.isUsuallyRemoving) {
			
				Object.keys(this.isUsuallyRemoving).forEach(dep => {
					
					projectPackage[dep] = _self.isUsuallyRemoving[dep]
					
				})
			
			}
			
			fs.writeFileSync(this.projectPkgPath, this.originalPkg ? this.originalPkg : JSON.stringify(projectPackage, null, '\t'))
			
			if(this.tempPkgLockCfg) npm.config.set("package-lock", this.tempPkgLockCfg)
			
		}
		
		beforeCmdRun() {
			
			this.beforeDefinePaths()

			if(this.npmRemoveCommands.indexOf(npm.command) !== -1 && this.isXerInstalling) return this.bCRRemove()
				
			if(this.isXerUp) return this.xerUp()
				
			if(this.npmRemoveCommands.indexOf(npm.command) !== -1 && !this.isXerInstalling && npm.argv[0] && !isGlobalArgvOriginal) this.backupPkg()
			
		}
		
		constructor() {
			
			const _self = this;
			
			_self.isXerInstalling = isXerInstalling
			
			_self.isXerUp = isXerUp
			
			_self.XerUpArgv = XerUpArgv
			
			_self.SaveDevArgv = SaveDevArgv
			
			_self.DeleteTrash = DeleteTrash
			
			_self.SaveArgv = SaveArgv
			
			_self.npmRemoveCommands = ["r", "rm", "remove", "un", "uninstall"]
	
			_self.npmInstallCommands = ["i", "install"]
			
			_self.xerUpDeleteCommands = ["d", "null", "r", "rm", "remove", "delete", "rmv", "dlt", "dl"]
			
			_self.xerUpReverseCommands = ["rv", "reverse", "rvs", "rvrs"]
			
			_self.xerUpSortCommands = ["s", "sort", "srt", "st"]
			
			npm.load(conf, function (er) {
				
				//we don't check sudo_user (by installation), bcs npm checks it before cb
				
				if (er) return errorHandler(er)
					
				_self.checkUpdates()
				
				if(_self.isXerInstalling) {
					
					if(process.platform.startsWith("win") && !process.env.USERPROFILE) return errorHandler(new Error("process.env.USERPROFILE is not defined!"))
					else if(process.platform.includes("linux") & !process.env.HOME) return errorHandler(new Error("process.env.HOME is not defined!"))
					
				}
				
				if(_self.isXerInstalling || _self.isXerUp || (!_self.isXerInstalling && _self.npmRemoveCommands.indexOf(npm.command) !== -1 && npm.argv[0] && !isGlobalArgvOriginal)) {
					
					_self.defaultPkgJSONIfNotExists = {
						"__modifiedBy": "npm-xeraglobal",
						"name": path.basename(npm.localPrefix),
						"version": "1.0.0",
						"description": "",
						"main": "index.js",
						"scripts": {
							"test": "echo \"Error: no test specified\" && exit 1"
						},
						"author": "",
						"license": "ISC",
						"dependencies": {},
						"devDependencies": {}
					}
					
					_self.GLOBAL_DIR = process.platform.startsWith("win") 
						? npm.globalDir : 
						process.execPath.includes(".nvm") 
						? path.join(process.execPath, "../../lib/node_modules") 
						: "/usr/lib/node_modules"
					
					_self.beforeCmdRun()
					
				}
				
				npm.commands[npm.command](npm.argv, function (err) {
					
					/*
					
					You have found an easter egg!

					          GHOST_ATTACK                         *****                                 DARIANKA

					░▀█░█████████████████▀▀░░░██░████	░░░░░░░░░░░░░░░▄▄░░░░░░░░░░░	░░░░░░░░░░▄▄██████▄░░▄██████▄▄░░░░░░░░░░
					▄▄█████████████████▀░░░░░░██░████	░░░░░░░░░░░░░░█░░█░░░░░░░░░░	░░░░░░░░░▀▀▄▀▀▀▀▀██▀▀██▀▀▀▀▀▄▀▀░░░░░░░░░
					███▀▀████████████▀░░░░░░░▄█░░████	░░░░░░░░░░░░░░█░░█░░░░░░░░░░	░░░░░░░░░░▄▀░░▄▄░░▀▄▄▀░░▄▄░░░█░░░░░░░░░░
					███▄░░░░▀▀█████▀░▄▀▄░░░░▄█░░▄████	░░░░░░░░░░░░░░█░░█░░░░░░░░░░	░░▄▄▀▀▀▀▀░█░░░██░░░██░░░██░░░█░▀▀▀▀▀▄▄░░
					░███▄▄░░▄▀▄░▀███▄▀▀░░▄▄▀█▀░░█████	░░░░░░░░░░░░░░█░░█░░░░░░░░░░	█▀░░░░░░░░▀▄░░░░░░█░░█░░░░░░▄▀░░░░░░░░▀█
					▄▄█▄▀█▄▄░▀▀████████▀███░░▄░██████	██████▄███▄████░░███▄░░░░░░░	█▄░░░░░░░░░░▀▀▄▄▀▀░░░░▀▀█▄▀▀░░░░░░░░░░▄█
					▀████▄▀▀▀██▀▀██▀▀██░░▀█░░█▄█████░	▓▓▓▓▓▓█░░░█░░░█░░█░░░███░░░░	░░░░░░░░░░░░░░█░░░░░░░░░░█░░░░░░░░░░░░░░
					░░▀▀███▄░▀█░░▀█░░░▀░█░░░▄██████░▄	▓▓▓▓▓▓█░░░█░░░█░░█░░░█░░█░░░	░░░░░░░▄░░░░░░█░░░░░░░░░░█░░░░░░▄░░░░░░░
					████▄▄▀██▄░█░░▄░░█▄░███░████▀▀░▄█	▓▓▓▓▓▓█░░░░░░░░░░░░░░█░░█░░░	░░░░░░░▀█▄▄▄░░░▀█▄░░░░▄▄▀░░░▄▄▄█▀░░░░░░░
					█▀▀▀▀▀▀░█████▄█▄▄████████▀░▄▄░▄██	▓▓▓▓▓▓█░░░░░░░░░░░░░░░░█░░░░	░░░░░░░░████████████████████████░░░░░░░░
					█████████████████████████████████	▓▓▓▓▓▓█████░░░░░░░░░██░░░░░░	░░░░░░░░░▀████████████████████▀░░░░░░░░░
					█████████████████████████████████	█████▀░░░░▀▀████████░░░░░░░░	░░░░░░░░░░░█▀██▀▀░░░░░░▀▀▀█▀█░░░░░░░░░░░
					█████████████████████████████████	░░░░░░░░░░░░░░░░░░░░░░░░░░░░	░░░░░░░░░░░░▀▄░▀▀▄▄▄▄▄▄▀▀▀▄▀░░░░░░░░░░░░
					█████████████████████████████████	░░░░░░░░░░░░░░░░░░░░░░░░░░░░	░░░░░░░░░░░░░░▀▀▄▄▄▄▄▄▄▄▀▀░░░░░░░░░░░░░░

					ORIGINAL: https://www.youtube.com/watch?v=7nfPu8qTiQU

					НА НАЦЙ

					MODIFIED: https://vk.cc/ar6lDt ПЗИ)

					*/
					
					if(!err && _self.npmInstallCommands.indexOf(npm.command) !== -1 && _self.isXerInstalling) return _self.xerInstall()
						
					if(!err && (_self.isUsuallyRemoving || _self.originalPkg)) _self.restorePkg()
					
					if (!err && npm.config.get('ham-it-up') && !npm.config.get('json') && !npm.config.get('parseable') && npm.command !== 'completion') {
						output('\n 🎵 I Have the Honour to Be Your Obedient Servant,🎵 ~ npm 📜🖋\n')
					}

					errorHandler.apply(this, arguments)
					
				})
			
			})
		
		}
		
		xerActions(existXer) {
			
			if(existXer) rimraf.sync(this.xerMainModulePath)
			else if(this.realRemovingModulePath && fs.existsSync(this.xerMainRealModulePath)) rimraf.sync(this.xerMainRealModulePath)
				
			this.copyFolderRecursiveSync(this.globalDirModulePath, this.globalXerPath)
			
			this.writeSupport()
			
			if(this.DeleteTrash && this.installingModuleName[0] != "@") this.DeleteTrashAction()
			
			this.writeDependencies()
			
		}
		
		xerInstall() {
				
			console.log("\n Start copying to " + this.globalXerPath);
			
			if(fs.existsSync(this.xerMainModulePackagePath) /* && fs.existsSync(this.globalDirPkgPath) */) {
			
				const xerMainModulePkg = this.writeAndParsePackageSync(this.xerMainModulePackagePath)
				
				const globarDirPkg = this.writeAndParsePackageSync(this.globalDirPkgPath)

				if(xerMainModulePkg.version != globarDirPkg.version || !xerMainModulePkg.version || !globarDirPkg.version) this.xerActions(true)
				else this.writeSupport()
				
			} else this.xerActions()
			
			console.log("\n Done!")
			
			return errorHandler(null)
			
		}
		
		DeleteTrashAction() {
			
			//console.log("\n Deleting unnecessary items");
			
			const _self = this;
			
			const trashFolders = [
				
				".idea",
				".git",
				".github",
				"example",
				"examples",
				"test",
				"tests",
				
			];
			
			const trashFiles = [
				
				".npmignore",
				".npmrc",
				".gitattributes",
				".gitignore",
				".gitmodules",
				".editorconfig",
				".eslintignore",
				".eslintrc",
				".travis.yml",
				".tidelift.yml",
				"appveyor.yml",
				"make",
				"makefile",
				"rakefile",
				
			];
			
			const trashFilesUpperCase = [
				
				"Make",
				"Makefile",
				"Rakefile",
				
			];
			
			trashFolders.concat(trashFiles).concat(trashFilesUpperCase).forEach(trash => {
				
				let trashPath = _self.convertBackSlash(_self.xerMainModulePath + "\\" + trash);
				
				if(fs.existsSync(trashPath)) rimraf.sync(trashPath);
				
			})

		}
		
		writeSupport() {
			
			const HOME_FOLDER = process.platform.startsWith("win") ? "process.env.USERPROFILE" : "(!process.env.SUDO_USER ? process.env.HOME : ('/home/' + process.env.SUDO_USER))";
			
			let support = '';
			
			if(this.installingModuleName == "gulp") {
				
				let liftoffPath = this.globalDirModulePath + "\\node_modules\\liftoff\\index.js"
				
				liftoffPath = this.convertBackSlash(liftoffPath)
				
				let liftoffOrigin = fs.readFileSync(liftoffPath).toString()
				
				let liftoff = liftoffOrigin;
				
				if(!liftoffOrigin.includes("if(fs.existsSync(") || !liftoffOrigin.includes(".node_modules")) { // !!|| !&&
				
					support += this.convertBackSlash('if(fs.existsSync(' + HOME_FOLDER + ' + "\\\\.node_modules\\\\gulp\\\\index.js")) modulePath = ' + HOME_FOLDER + ' + "\\\\.node_modules\\\\gulp\\\\index.js";\n\telse modulePath = resolve.sync(this.moduleName, { basedir: configBase || cwd, paths: paths });');

					liftoff = liftoff.replace(/modulePath(\s)?=(\s)?r.+;/, support)
					
				}
				
				if(!liftoffOrigin.match(/require\(['"]fs['"]\)/)) {
					
					liftoff = liftoff.replace(/(var|const|let) path(\s)?=(\s)?require(\s)?\(['"]path['"]\);/, "var path = require('path');\nvar fs = require('fs');")
					
				}
				
				if(liftoffOrigin != liftoff) fs.writeFileSync(liftoffPath, liftoff)
				
			} else if(this.installingModuleName == "webpack" || this.installingModuleName == "webpack-stream") {
				
				let ResolverFactoryPath = this.globalXerPath + "\\" + this.installingModuleName + "\\node_modules\\enhanced-resolve\\lib\\ResolverFactory.js"
				
				ResolverFactoryPath = this.convertBackSlash(ResolverFactoryPath)
				
				let origResolverFactory = fs.readFileSync(ResolverFactoryPath).toString()
				
				if(!origResolverFactory.includes(".node_modules")) {
				
					support += this.convertBackSlash('modules.push(' + HOME_FOLDER + ' + "\\\\.node_modules")\n\n\tmainFields = mainFields.map')
					
					fs.writeFileSync(ResolverFactoryPath, origResolverFactory.replace(/mainFields(\s)?=(\s)?mainFields.map/, support))
					
				}
				
			} else if(this.realInstallingModuleName == "@babel/core") {
				
				let nodeModulesPaths = this.globalXerPath + "\\" + this.realInstallingModuleName + "\\node_modules\\resolve\\lib\\node-modules-paths.js"
				
				nodeModulesPaths = this.convertBackSlash(nodeModulesPaths)
				
				let origResolve = fs.readFileSync(nodeModulesPaths).toString()
				
				if(!origResolve.includes(".node_modules")) {
				
					support = this.convertBackSlash("['node_modules', " + HOME_FOLDER + " + '\\\\.node_modules']")

					fs.writeFileSync(nodeModulesPaths, origResolve.replace(/\[('|")node_modules('|")\]/, support))
					
				}
				
			} else if(this.installingModuleName == "resolve") {
				
				let nodeModulesPaths = this.globalXerPath + "\\" + this.installingModuleName + "\\lib\\node-modules-paths.js"
				
				nodeModulesPaths = this.convertBackSlash(nodeModulesPaths)
				
				let origResolve = fs.readFileSync(nodeModulesPaths).toString()
				
				if(!origResolve.includes(".node_modules")) {
				
					support = this.convertBackSlash("['node_modules', " + HOME_FOLDER + " + '\\\\.node_modules']")
				
					fs.writeFileSync(nodeModulesPaths, origResolve.replace(/\[('|")node_modules('|")\]/, support))
					
				}
				
			}
			
		}
		
		writeDependencies() {
			
			const dependencyName = this.SaveDevArgv && !this.SaveArgv ? "devDependencies" : "dependencies"
			
			if(!fs.existsSync(this.projectPkgPath)) fs.writeFileSync(this.projectPkgPath, JSON.stringify(this.defaultPkgJSONIfNotExists, null, '\t'))
			
			const projectPackage = this.writeAndParsePackageSync(this.projectPkgPath)
			
			let globarDirPkg = {}
			
			if(fs.existsSync(this.globalDirPkgPath)) globarDirPkg = this.writeAndParsePackageSync(this.globalDirPkgPath) 
			else globarDirPkg = this.writeAndParsePackageSync(this.globalDirRealPkgPath)
			
			if(!projectPackage[dependencyName]) projectPackage[dependencyName] = {}
				
			projectPackage[dependencyName][this.realInstallingModuleName] = "^" + globarDirPkg.version
			
			projectPackage.__modifiedBy = "npm-xeraglobal"

			fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
			
		}
		
	}
	
	new NPM_CLI_MOD
	
})()