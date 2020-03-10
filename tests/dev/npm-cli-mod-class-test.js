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
		
		isDirectory(source) {
			return fs.lstatSync(source).isDirectory()
		}

        getDirectories(source) {
			return fs.readdirSync(source).map(name => path.join(source, name)).filter(this.isDirectory);
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
		
		bCRInstall() {
				
			this.projectPackage = this.writeAndParsePackageSync(this.projectPackagePath)
				
			const _self = this;
			
			["dependencies", "devDependencies"].forEach((dep) => {
				
				if(!_self.projectPackage[dep]) return
		
				if(!_self.TEMP_PROJECT_PACKAGE) _self.TEMP_PROJECT_PACKAGE = {}

				_self.TEMP_PROJECT_PACKAGE[dep] = Object.assign({}, _self.projectPackage[dep])

				delete _self.projectPackage[dep]

			})

			fs.writeFileSync(this.projectPackagePath, JSON.stringify(this.projectPackage, null, '\t'))
				
		}
		
		bCRRemove() {

			console.log("\n Removing from: " + this.globalXerPath)

			let itWasRealDeleting = false;

			if( fs.existsSync( this.xerMainModulePath ) ) {

				itWasRealDeleting = true;
				
				this.xerMainModulePackage = this.writeAndParsePackageSync(this.xerMainModulePackagePath)
				
				if(this.xerMainModulePackage.dependencies) {
					
					for(let dependency in this.xerMainModulePackage.dependencies) {
						
						const dependencyPath = this.xerDependenciesPath + "\\" + dependency
						
						//!!!Удаляем депенденсы, которые объявлены!!!
						
						if( fs.existsSync( dependencyPath ) ) this.deleteFolderRecursive(dependencyPath)
						
					}
					
				}

				this.deleteFolderRecursive(this.xerMainModulePath)

				const projectPackage = this.writeAndParsePackageSync(this.projectPackagePath)
				
				const _self = this;
				
				["dependencies", "devDependencies"].forEach(dep => {
					
					if(projectPackage[dep]) {
						
						if(projectPackage[dep][_self.installingModuleName]) {
							
							delete projectPackage[dep][_self.installingModuleName]
							
						}
						
					}
					
				})

				fs.writeFileSync(this.projectPackagePath, JSON.stringify(projectPackage, null, '\t'))

			}

			if( fs.existsSync( this.projectNodeModulesPath ) ) this.deleteFolderRecursive(this.projectNodeModulesPath)

			if(itWasRealDeleting) console.log("\n Done!")
			else console.error("\n Ooops!")

			return errorHandler(null)
			
		}
		
		beforeDefinePaths() {
			
			this.globalXerPath = process.env.USERPROFILE + "\\.node_modules"
							 
			this.projectPackagePath = npm.prefix + "\\package.json"
			
			this.projectNodeModulesPath = npm.prefix + "\\node_modules"
			
			
			
			this.installingModuleName = npm.argv[0]
			
			
			
			this.xerDependenciesPath = this.globalXerPath + "\\node_modules"
			
			this.xerMainModulePath = this.globalXerPath + "\\" + npm.argv[0]
			
			this.xerMainModulePackagePath = this.xerMainModulePath + "\\package.json"
			
			
			
			this.TEMP_PACKAGE_LOCK_CFG = npm.config.get("package-lock")

			npm.config.set("package-lock", false)
			
			this.TEMP_PROJECT_PACKAGE = null
			
		}
		
		beforeCmdRun() {
			
			this.beforeDefinePaths()
			
			if(this.npmInstallCommands.indexOf(npm.command) !== -1) this.bCRInstall()

			if(this.npmRemoveCommands.indexOf(npm.command) !== -1) this.bCRRemove()
			
		}
		
		constructor() {
			
			const _self = this;
			
			_self.xerArgv = ["x", "xer", "xera", "хер", "хуй"];
			
			_self.parsedXerArgv = _self.xerArgv.map(arg => arg = "-" + arg).concat( _self.xerArgv.map(arg => arg = "--" + arg) )
			
			_self.isXerInstalling = process.argv.filter((el) => _self.parsedXerArgv.indexOf(el) !== -1).length ? true : false
			
			_self.npmRemoveCommands = ["r", "rm", "remove", "un", "uninstall"]
			
			_self.npmInstallCommands = ["i", "install"]
			
			npm.load(conf, function (er) {
				
				if (er) return errorHandler(er)
					
				_self.checkUpdates()
				
				if(!process.env.USERPROFILE && _self.isXerInstalling) return errorHandler(new Error("process.env.USERPROFILE is not defined!"))
				
				if(_self.isXerInstalling) _self.beforeCmdRun()
				
				npm.commands[npm.command](npm.argv, function (err) {
					
					/*
			
								ЕБП

					─────────────────────────────
					────────────▄████▄───────────
					───────────▄██████▄──────────
					───────────█──────█──────────
					───────────█──────█──────────
					───────────█─▄▄▄▄─█──────────
					───────────█──────█──────────
					───────────█──────█──────────
					───────────█─▄▄▄▄─█──────────
					───────────█──────█──────────
					───────────█──────█──────────
					───────────█─▄▄▄▄─█──────────
					───────────█──────█──────────
					───────────█──────█──────────
					───────────█─▄▄▄▄─█▄▄▄▄──────
					────▄███████──────█▀█─▀██▄───
					▄█████─────█──────█──█─▀██▄──
					█────█─────█──────█───█──██▄─
					█────█─────█──────█────█──██▄
					█────█─────█──────█─────█──██
					█────█─────█──────█─────█─██▀
					█────█─────█──────█─────███▀─
					█────█─────█──────█─────██▀──
					█───────────────────────██───
					███▄────────────────────█▀───
					─▀███▄────────────────▄██────
					───▀████████████████████▀────
					─────▀████████████████▀──────
					────────▀███████████▀────────

					https://www.youtube.com/watch?v=7nfPu8qTiQU

					НА НАЦЙ

					https://vk.cc/ar6lDt

					*/
					
					if(!err && _self.npmInstallCommands.indexOf(npm.command) !== -1 && _self.isXerInstalling) return _self.xerInstall()
					
					if (!err && npm.config.get('ham-it-up') && !npm.config.get('json') && !npm.config.get('parseable') && npm.command !== 'completion') {
						output('\n 🎵 I Have the Honour to Be Your Obedient Servant,🎵 ~ npm 📜🖋\n')
					}

					errorHandler.apply(this, arguments)
					
				})
			
			})
		
		}
		
		createLocalDependenciesPathIfNotExists() {
			
			if(!fs.existsSync(this.xerDependenciesPath)) fs.mkdirSync(this.xerDependenciesPath)
			
		}
		
		deleteProjectNodeModules() {
			
			this.deleteFolderRecursive(this.projectNodeModulesPath)
			
		}
		
		copyLocalDependencies(_deleteProjectNodeModules) {
			
			const _self = this;
				
			this.projectNodeLocalDependencies.forEach(dependencyPath => {
				
				const xerPathOfDependency = _self.xerDependenciesPath + "\\" + path.basename(dependencyPath)
				
				if( fs.existsSync( xerPathOfDependency ) ) {
					
					if(_deleteProjectNodeModules) return
					
					const xerPathOfThePackageOfDependency = xerPathOfDependency + "\\package.json"
					
					if( fs.existsSync( xerPathOfThePackageOfDependency  ) ) {
				
						const pkgOfDep = _self.writeAndParsePackageSync(xerPathOfThePackageOfDependency)
						
						const pathOfThePackageOfProjectDep = dependencyPath + "\\package.json"
						
						const pkgOfProjectDep = _self.writeAndParsePackageSync(pathOfThePackageOfProjectDep)
						
						if(pkgOfDep.version != pkgOfProjectDep.version) {
							
							return this.additionalDevDependencies.push(dependencyPath)
							
						}
						
					} else return _self.copyFolderRecursiveSync(dependencyPath, _self.xerDependenciesPath)
					
				} else {
			
					_self.copyFolderRecursiveSync(dependencyPath, _self.xerDependenciesPath)
				
				}
				
			})
			
			if(_deleteProjectNodeModules) {
				
				this.deleteProjectNodeModules()
				
				console.log("\n Done!")
			
				return errorHandler(null)
				
			}
			
		}
		
		xerInstallDefines() {
			
			this.projectNodeModules = this.getDirectories(this.projectNodeModulesPath)
			
			this.xerModules = this.getDirectories(this.globalXerPath)
			
			
			
			
			this.installingModulePath = this.projectNodeModulesPath + "\\" + this.installingModuleName
			
			this.installingModulePackagePath = this.installingModulePath + "\\package.json"
			
			
			
			
			this.projectNodeModules.splice(this.projectNodeModules.indexOf(this.installingModulePath), 1)
			
			this.additionalDevDependencies = []
			
		}
		
		xerInstall() {
			
			const _self = this;
			
			this.xerInstallDefines()
			
			if(!this.installingModuleName) {
				
				console.log("\n Starting copy to: " + this.xerDependenciesPath)
				
				this.projectNodeLocalDependencies = this.projectNodeModules
				
				return this.copyLocalDependencies(true)
				
			}
				
			console.log("\n Starting copy to " + this.globalXerPath);
			
			[
			
				"restoreProjectPackageDependencies", //+
				"writeSupportWithHomePathToModules", //?
				"defineDependenciesOfDependencies", //+
				"createLocalDependenciesPathIfNotExists", //+
				"copyLocalDependencies", //+
				"copyInstallingModule", //+
				"copyInstallingModuleMainDependencies", //+
				"deleteProjectNodeModules" //+
				
			].forEach(action => _self[action]())
			
			console.log("\n Done!")
			
			npm.config.set("package-lock", this.TEMP_PACKAGE_LOCK_CFG)
			
			return errorHandler(null)
			
		}
		
		restoreProjectPackageDependencies() {
			
			if(this.TEMP_PROJECT_PACKAGE) {
				
				const _self = this;
				
				Object.keys(this.TEMP_PROJECT_PACKAGE).forEach((dep) => {
					
					//dependencies || devDependencies
					
					const DepDevDep = _self.TEMP_PROJECT_PACKAGE[dep];
					
					Object.keys(DepDevDep).forEach((thdep) => {
						
						if(!_self.projectPackage[dep]) _self.projectPackage[dep] = {}
						
						let iMPDep = _self.projectPackage[dep]
						
						if(iMPDep[thdep] && iMPDep[thdep] == DepDevDep[thdep]) return
							
						_self.projectPackage[dep][thdep] = DepDevDep[thdep]
						
					})
					
				})
				
				fs.writeFileSync(this.projectPackagePath, JSON.stringify(this.projectPackage, null, '\t'))
				
				delete this.TEMP_PROJECT_PACKAGE
			
			}
			
		}
		
		writeSupportWithHomePathToModules() {
			
			/* if(this.installingModuleName == "gulp") {
				
				let origGulpCli = fs.readFileSync(this.projectNodeModulesPath + "\\gulp-cli").toString()
				
				fs.writeFileSync(this.projectNodeModulesPath + "\\gulp-cli", origGulpCli.replace(env.configProps = cfg;, 'env.configProps = cfg;ntenv.cwd = process.env.USERPROFILE  process.env.USERPROFILE + .node_modules  CUsersGhost.node_modules;'))
				
			} */
			
		}
		
		defineDependenciesOfDependencies() {
			
			this.installingModulePackage = this.writeAndParsePackageSync(this.installingModulePackagePath)
			
			this.installingModuleMainDependencies = []
			
			if(this.installingModulePackage.dependencies) {
				
				for(let dependency in this.installingModulePackage.dependencies) {
				
					this.installingModuleMainDependencies.push(this.projectNodeModulesPath + "\\" + dependency)
				
				}
				
			}
			
			if(!this.installingModuleMainDependencies.length) return this.projectNodeLocalDependencies = []
			
			this.projectNodeLocalDependencies = Object.assign([], this.projectNodeModules)
			
			for(let i = 0; i < this.installingModuleMainDependencies.length; i++) {
				
				let thMainDependencyPath = this.installingModuleMainDependencies[i]
				
				this.projectNodeLocalDependencies.splice(this.projectNodeModules.indexOf(thMainDependencyPath), 1)
				
			}
			
		}
		
		copyInstallingModule() {
			
			if(fs.existsSync(this.xerMainModulePath)) {
				
				//Всегда предполагается наличие package.json
			
				if(this.installingModulePackage.version == this.writeAndParsePackageSync(this.xerMainModulePackagePath).version) return
				
				this.deleteFolderRecursive(this.xerMainModulePath)
					
			}
			
			for(let i = 0; i < this.additionalDevDependencies.length; i++) {
				
				this.copyFolderRecursiveSync(this.additionalDevDependencies[i], this.installingModulePath + "\\node_modules")
				
			}
			
			this.copyFolderRecursiveSync(this.installingModulePath, this.globalXerPath)
			
		}
		
		copyInstallingModuleMainDependencies() {
				
			for(let i = 0; i <= this.installingModuleMainDependencies.length; i++) {
				
				const thMainDependencyPath = this.installingModuleMainDependencies[i]
				
				if(!thMainDependencyPath) continue
				
				const nameDep = path.basename(thMainDependencyPath)
				
				const xerPathOfThisDependency = this.globalXerPath + "\\" + nameDep
				
				if(fs.existsSync(this.installingModulePath + "\\node_modules\\" + nameDep)) continue
				
				if(fs.existsSync(xerPathOfThisDependency)) {
					
					const pathOfThePackageOfThDependency = thMainDependencyPath + "\\package.json"
					
					const xerPathOfThePackage = xerPathOfThisDependency + "\\package.json"
					
					
					const thMainDependencyPackage = this.writeAndParsePackageSync(pathOfThePackageOfThDependency)
					
					const xerPackage = this.writeAndParsePackageSync(xerPathOfThePackage)
					
					
					if(thMainDependencyPackage.version == xerPackage.version) continue
						
					//ставим в девдепенденсиз
					
					if(!fs.existsSync(this.xerMainModulePath + "\\node_modules")) fs.mkdirSync(this.xerMainModulePath + "\\node_modules")
					
					this.copyFolderRecursiveSync(thMainDependencyPath, this.xerMainModulePath + "\\node_modules")
					
					continue
				
				}
			
				this.copyFolderRecursiveSync(thMainDependencyPath, this.globalXerPath)
				
			}
			
		}
		
	}
	
	new NPM_CLI_MOD
	
})()