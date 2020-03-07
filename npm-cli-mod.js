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
	
	// if npm is called as "npmg" or "npm_g", then
	// run in global mode.
	
	if (process.argv[1][process.argv[1].length - 1] === 'g') {
		
		process.argv.splice(1, 1, 'npm', '-g')
		
	}
	
	
	
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
	
	
	
	var SaveArgv = 0, SaveDevArgv = 0
	
	
	
	if(isXerInstalling) {
		
		const GlobalArgv = process.argv.filter(el => el == "-g" || el == "--global").length
		
		if(!GlobalArgv) process.argv.push("-g")
		
	}
	
	
	if(isXerInstalling || isXerUp) {
		
		SaveArgv = process.argv.filter(el => el == "-S" || el == "--save").length
		
		SaveDevArgv = process.argv.filter(el => el == "-D" || el == "--save-dev").length
		
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
		
		deleteFolderRecursive(source) {
			
			const _self = this;

			fs.readdirSync(source).forEach((file, index) => {

				const curPath = path.join(source, file);

				if (fs.lstatSync(curPath).isDirectory()) { 

					// recurse

					_self.deleteFolderRecursive(curPath);

				} else { 

					// delete file

					fs.unlinkSync(curPath);

				}

			});

			fs.rmdirSync(source);
			
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
		
		writeAndParsePackageSync(path) {
			
			return JSON.parse(fs.readFileSync(path).toString())
			
		}
		
		bCRRemove() {

			console.log("\n Removing from " + this.globalXerPath)

			let itWasRealDeleting = false;

			if( fs.existsSync( this.xerMainModulePath ) ) {

				itWasRealDeleting = true;

				this.deleteFolderRecursive(this.xerMainModulePath)
				
				if(fs.existsSync(this.projectPkgPath)) {

					const projectPackage = this.writeAndParsePackageSync(this.projectPkgPath)
					
					const _self = this;
					
					["dependencies", "devDependencies"].forEach(dep => {
						
						if(projectPackage[dep]) {
							
							if(projectPackage[dep][_self.installingModuleName]) {
								
								delete projectPackage[dep][_self.installingModuleName]
								
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
			else console.error("\n Nothing happened (the removed module does not exist)!\n")

			//return errorHandler(null)
			
		}
		
		extraWritePkg(projectPackage) {
			
			fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
				
			console.log("\n Done!")
			
			return errorHandler(null)
			
		}
		
		getProjectPkg() {
			
			var projectPackage = this.writeAndParsePackageSync(this.projectPkgPath)
		
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
				
				let thXerPackagePath = this.globalXerPath + "\\" + pkgName
				
				if(!fs.existsSync(thXerPackagePath)) {
					
					console.error("\n The module " + pkgName + " not found in " + this.globalXerPath)
					
					continue
					
				}
				
				const thXerPackage = this.writeAndParsePackageSync(thXerPackagePath + "\\package.json")
				
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
			
			this.globalXerPath = process.env.USERPROFILE + "\\.node_modules"
			
			this.installingModuleName = npm.argv[0]
			
			this.globalDirModulePath = this.GLOBAL_DIR + "\\" + this.installingModuleName
							 
			this.globalDirPkgPath = this.globalDirModulePath + "\\package.json"
			
			this.projectPkgPath = npm.localPrefix + "\\package.json"
			
			this.xerMainModulePath = this.globalXerPath + "\\" + npm.argv[0]
			
			this.xerMainModulePackagePath = this.xerMainModulePath + "\\package.json"
			
		}
		
		backupPkg() {
			
			const _self = this;
			
			var projectPackage = this.getProjectPkg()
			
			_self.isUsuallyRemoving = null;
			
			["dependencies", "devDependencies"].forEach(dep => {
				
				if(!projectPackage[dep]) return
				
				if(!_self.isUsuallyRemoving) _self.isUsuallyRemoving = {}
				
				_self.isUsuallyRemoving[dep] = Object.assign({}, projectPackage[dep])
				
				for(let dependency in _self.isUsuallyRemoving[dep]) {
					
					if(dependency == _self.installingModuleName) delete _self.isUsuallyRemoving[dep][dependency]
					
				}
				
				delete projectPackage[dep]
				
			})
			
			fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
			
		}
		
		restorePkg() {
			
			const _self = this;
			
			var projectPackage = this.getProjectPkg();
			
			Object.keys(this.isUsuallyRemoving).forEach(dep => {
				
				projectPackage[dep] = _self.isUsuallyRemoving[dep]
				
			})
			
			fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
			
		}
		
		beforeCmdRun() {
			
			this.beforeDefinePaths()

			if(this.npmRemoveCommands.indexOf(npm.command) !== -1 && this.isXerInstalling) return this.bCRRemove()
				
			if(this.isXerUp) return this.xerUp()
				
			if(this.npmRemoveCommands.indexOf(npm.command) !== -1 && !this.isXerInstalling) this.backupPkg()
			
		}
		
		constructor() {
			
			const _self = this;
			
			_self.isXerInstalling = isXerInstalling
			
			_self.isXerUp = isXerUp
			
			_self.XerUpArgv = XerUpArgv
			
			_self.SaveDevArgv = SaveDevArgv
			
			_self.SaveArgv = SaveArgv
			
			_self.npmRemoveCommands = ["r", "rm", "remove", "un", "uninstall"]
	
			_self.npmInstallCommands = ["i", "install"]
			
			_self.xerUpDeleteCommands = ["d", "null", "r", "rm", "remove", "delete", "rmv", "dlt", "dl"]
			
			_self.xerUpReverseCommands = ["rv", "reverse", "rvs", "rvrs"]
			
			_self.xerUpSortCommands = ["s", "sort", "srt", "st"]
			
			npm.load(conf, function (er) {
				
				if (er) return errorHandler(er)
					
				_self.checkUpdates()
				
				if(!process.env.USERPROFILE && _self.isXerInstalling) return errorHandler(new Error("process.env.USERPROFILE is not defined!"))
				
				if(_self.isXerInstalling || _self.isXerUp || (!_self.isXerInstalling && _self.npmRemoveCommands.indexOf(npm.command) !== -1)) {
					
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
					
					_self.GLOBAL_DIR = npm.globalDir
					
					_self.beforeCmdRun()
					
				}
				
				npm.commands[npm.command](npm.argv, function (err) {
					
					/*??? ЕБУЧИЕ БЛЯТЬ ПАСКАЛКИ | You have found an easter egg!

					          GHOST_ATTACK                         FUCKS                                 DARIANKA

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

					https://www.youtube.com/watch?v=7nfPu8qTiQU

					НА НАХЦЙ

					http://porno365.blog/movie/21304 ПАПРОБУЙТЕКАЗАЙТИИНОСТРАНЦЫ)

					*/
					
					if(!err && _self.npmInstallCommands.indexOf(npm.command) !== -1 && _self.isXerInstalling) return _self.xerInstall()
						
					if(!err && _self.isUsuallyRemoving) _self.restorePkg()
					
					if (!err && npm.config.get('ham-it-up') && !npm.config.get('json') && !npm.config.get('parseable') && npm.command !== 'completion') {
						output('\n 🎵 I Have the Honour to Be Your Obedient Servant,🎵 ~ npm 📜🖋\n')
					}

					errorHandler.apply(this, arguments)
					
				})
			
			})
		
		}
		
		xerActions(existXer) {
			
			if(existXer) deleteFolderRecursive(this.xerMainModulePath)
				
			this.copyFolderRecursiveSync(this.globalDirModulePath, this.globalXerPath)
			
			this.writeSupport()
			
			this.writeDependencies()
			
		}
		
		xerInstall() {
				
			console.log("\n Starting copy to " + this.globalXerPath);
			
			if(fs.existsSync(this.xerMainModulePackagePath) && fs.existsSync(this.globalDirPkgPath)) {
			
				const xerMainModulePkg = this.writeAndParsePackageSync(this.xerMainModulePackagePath)
				
				const globarDirPkg = this.writeAndParsePackageSync(this.globalDirPkgPath)

				if(xerMainModulePkg.version != globarDirPkg.version || !xerMainModulePkg.version || !globarDirPkg.version) this.xerActions(true)
				
			} else this.xerActions()
			
			console.log("\n Done!")
			
			return errorHandler(null)
			
		}
		
		writeSupport() {
			
			if(this.installingModuleName == "gulp") {
				
				let liftoffPath = this.globalDirModulePath + "\\node_modules\\liftoff\\index.js"
				
				const origLiftoff = fs.readFileSync(liftoffPath).toString()
				
				fs.writeFileSync(liftoffPath, origLiftoff.replace(/modulePath(\s)?=(\s)?r.+;/, 'modulePath = process.env.USERPROFILE + "\\\\.node_modules\\\\gulp\\\\index.js"'))
				
			}
			
		}
		
		writeDependencies() {
			
			const dependencyName = this.SaveDevArgv && !this.SaveArgv ? "devDependencies" : "dependencies"
			
			if(!fs.existsSync(this.projectPkgPath)) fs.writeFileSync(this.projectPkgPath, JSON.stringify(this.defaultPkgJSONIfNotExists, null, '\t'))
			
			const projectPackage = this.writeAndParsePackageSync(this.projectPkgPath)
			
			const globarDirPkg = this.writeAndParsePackageSync(this.globalDirPkgPath) 
			
			if(!projectPackage[dependencyName]) projectPackage[dependencyName] = {}
				
			projectPackage[dependencyName][this.installingModuleName] = "^" + globarDirPkg.version
			
			projectPackage.__modifiedBy = "npm-xeraglobal"

			fs.writeFileSync(this.projectPkgPath, JSON.stringify(projectPackage, null, '\t'))
			
		}
		
	}
	
	new NPM_CLI_MOD
	
})()