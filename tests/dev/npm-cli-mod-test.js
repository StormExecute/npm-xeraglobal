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
    return
  }

  process.title = 'npm'

  var unsupported = require('../lib/utils/unsupported.js')
  unsupported.checkForBrokenNode()

  var log = require('npmlog')
  log.pause() // will be unpaused when config is loaded.
  log.info('it worked if it ends with', 'ok')

  unsupported.checkForUnsupportedNode()

  var npm = require('../lib/npm.js')
  var npmconf = require('../lib/config/core.js')
  var errorHandler = require('../lib/utils/error-handler.js')

  var configDefs = npmconf.defs
  var shorthands = configDefs.shorthands
  var types = configDefs.types
  var nopt = require('nopt')

  // if npm is called as "npmg" or "npm_g", then
  // run in global mode.
  if (process.argv[1][process.argv[1].length - 1] === 'g') {
    process.argv.splice(1, 1, 'npm', '-g')
  }

  log.verbose('cli', process.argv)

  var conf = nopt(types, shorthands)
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
  npm.load(conf, function (er) {
    if (er) return errorHandler(er)
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
    //console.log(npm.argv);

    const ___CUSTOM_ARGV_FILTER = process.argv.filter((el) => el == '-xer' || el == '-x' || el == '-хуй' || el == '-хер' || el == '--xer' || el == '--x' || el == '--хуй' || el == '--хер')

    var isTempChangeConfig = null

    if(___CUSTOM_ARGV_FILTER.length) {

      const fs = require('fs')
      const path = require('path')

      global.deleteFolderRecursive = function(source) {

        fs.readdirSync(source).forEach((file, index) => {

          const curPath = path.join(source, file);

          if (fs.lstatSync(curPath).isDirectory()) { 

            // recurse

            deleteFolderRecursive(curPath);

          } else { 

            // delete file

            fs.unlinkSync(curPath);

          }

        });

        fs.rmdirSync(source);

      };

      global.globalXer = process.env.USERPROFILE 
                      ?
                      process.env.USERPROFILE + "\\.node_modules"
                      : 
                      "C\\Users\\Ghost\\.node_modules"

      if(npm.command == "remove" || npm.command == "r" || npm.command == "un" || npm.command == "uninstall" || npm.command == "rm") {

          console.log("\n Начинаем ебение из херо-глобальной директории: " + globalXer)

          let itWasRealDeleting = false;

          let removeDir = globalXer + "\\" + npm.argv[0]

          if( fs.existsSync( removeDir ) ) {

            itWasRealDeleting = true;

            deleteFolderRecursive(removeDir)

            try {

              var pkg = JSON.parse(fs.readFileSync(npm.prefix + "\\package.json").toString())

            } catch(e) {

              return errorHandler(e)

            }

            if(pkg.dependencies) if(pkg.dependencies[npm.argv[0]]) delete pkg.dependencies[npm.argv[0]];
            if(pkg.devDependencies) if(pkg.devDependencies[npm.argv[0]]) delete pkg.devDependencies[npm.argv[0]];

            fs.writeFileSync(npm.prefix + "\\package.json", JSON.stringify(pkg, null, '\t'))

          }

          if( fs.existsSync( npm.prefix + "\\node_modules\\" ) ) deleteFolderRecursive(npm.prefix + "\\node_modules\\")

          if(itWasRealDeleting) console.log("\n Хуяк выебали хуеглобалку!")
          else console.error("\n Пиздец, модуля итак нема блеат!")

          return errorHandler(null)

      }

      isTempChangeConfig = npm.config.get("package-lock")

      npm.config.set("package-lock", false)

    }
	
	var TEMP_DEP = null
	
	if((npm.command == "i" || npm.command == "install" ) && ___CUSTOM_ARGV_FILTER.length) {
		
		try {

		  var pkg = JSON.parse(fs.readFileSync(npm.prefix + "\\package.json").toString())

		} catch(e) {

		  return errorHandler(e)

		}
		
		["dependencies", "devDependencies"].forEach((dep) => {
			
			if(!TEMP_DEP) TEMP_DEP = {}
			
			TEMP_DEP[dep] = Object.assign({}, pkg[dep])
			
			delete pkg[dep]
			
		})
		
		fs.writeFileSync(npm.prefix + "\\package.json", JSON.stringify(pkg, null, '\t'))
		
	}

    npm.commands[npm.command](npm.argv, function (err) {

      if(isTempChangeConfig != null) npm.config.set("package-lock", isTempChangeConfig)

      if(!err && (npm.command == "i" || npm.command == "install") && ___CUSTOM_ARGV_FILTER.length) {

        log.disableProgress()

        const fs = require('fs')
        const path = require('path')

        const isDirectory = source => fs.lstatSync(source).isDirectory()

        const getDirectories = source =>
          fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

        function copyFileSync( source, target ) {

            var targetFile = target;

            //if target is a directory a new file with the same name will be created
            if ( fs.existsSync( target ) ) {
                if ( fs.lstatSync( target ).isDirectory() ) {
                    targetFile = path.join( target, path.basename( source ) );
                }
            }

            fs.writeFileSync(targetFile, fs.readFileSync(source));
        }

        function copyFolderRecursiveSync( source, target ) {
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
                        copyFolderRecursiveSync( curSource, targetFolder );
                    } else {
                        copyFileSync( curSource, targetFolder );
                    }
                } );
            }
        }

        function asyncEachSeries(arr, iterator, callback) {
          callback = callback || function () {};
          if (!Array.isArray(arr) || !arr.length) {
              return callback();
          }
          var completed = 0;
          var iterate = function () {
            iterator(arr[completed], function (err) {
              if (err) {
                callback(err);
                callback = function () {};
              }
              else {
                ++completed;
                if (completed >= arr.length) { callback(); }
                else { nextTick(iterate); }
              }
            });
          };
          iterate();
        };

        function nextTick (cb) {
          if (typeof setImmediate === 'function') {
            setImmediate(cb);
          } else {
            process.nextTick(cb);
          }
        }
		
		let newModules = getDirectories(npm.prefix + "/node_modules")
		
		if(!npm.argv[0]) {
			
			newModules.forEach((module) => {
				
				copyFolderRecursiveSync(module, globalXer);
				
			})
			
			return errorHandler(null)
			
		}

        let xeroModules = getDirectories(globalXer)
        let thisModule = npm.prefix + "\\node_modules\\" + npm.argv[0];

        newModules.splice(newModules.indexOf(thisModule), 1)

        console.log("\n Starting copy to: " + globalXer)

        //console.log(newModules, xeroModules, npm.argv, npm.prefix)

        var self = this

        new Promise((res, rej) => {

          fs.readFile(thisModule + "/package.json", function(e, data) {

              if(e && e.code != "ENOENT") {

                err = e;
                return errorHandler.apply(self, arguments)

              }

              if(!data) {

                err = "Error!"
                return errorHandler.apply(self, arguments)

              }

              res(data.toString());

            })

        }).then(d => {

          return new Promise((res, rej) => {

            try {

              var pkg = JSON.parse(d)

            } catch(e) {

              err = e;
              return errorHandler.apply(self, arguments)

            }
			
			//Возвращаем темп, если есть
			
			if(TEMP_DEP) {
				
				Object.keys(TEMP_DEP).forEach((dep) => {
					
					Object.keys(TEMP_DEP[dep]).forEach((thdep) => {
						
						if(pkg[dep][thdep] && pkg[dep][thdep] == TEMP_DEP[dep][thdep]) return
							
						pkg[dep][thdep] = TEMP_DEP[dep][thdep]
						
					})
					
				})
				
				delete TEMP_DEP
			
			}
			
			fs.writeFileSync(npm.prefix + "\\package.json", JSON.stringify(pkg, null, '\t'))
			
			if(npm.argv[0] == "gulp") {
				
				fs.readFileSync(npm.prefix + "\\node_modules\\gulp-cli")
				
			}

            res(pkg)

          })

        }).then(pkg => {

          let thDepGlob = globalXer + thisModule.replace(npm.prefix + "\\node_modules", "");

          let targetFolder = path.join( globalXer, path.basename( thisModule ) );

          if ( fs.existsSync( targetFolder ) ) {

            let installedPkg = JSON.parse(fs.readFileSync(thDepGlob + "/package.json").toString());

            if(pkg.version == installedPkg.version) return "isEnd"
            else deleteFolderRecursive(thDepGlob);

          }

          copyFolderRecursiveSync(thisModule, globalXer);

          deleteFolderRecursive(thisModule);

          return {mainPkg: pkg, thDepGlob: thDepGlob + "\\node_modules"}

        }).then(main => {

          asyncEachSeries(newModules, function(thDep, next) {

            if(main == "isEnd") return next()

            return new Promise(function(resolve, reject) {

              fs.readFile(thDep + "/package.json", function(e, data) {

                if(e && e.code != "ENOENT") {

                  err = e;
                  return errorHandler.apply(self, arguments)

                }

                resolve(data ? data.toString() : "isOther");

              })

            }).then(d => {

              if(d != "isOther") {

                try {

                  var pkg = JSON.parse(d)

                } catch(e) {

                  err = e;
                  return errorHandler.apply(self, arguments)

                }

                return pkg

              } else return d

            }).then(pkg => {

              let thDepGlob = globalXer + "\\" + npm.argv[0] + "\\node_modules"

              if(pkg == "isOther") {

                let thDepGlob = globalXer + thDep.replace(npm.prefix + "\\node_modules", "");

                if(xeroModules.indexOf( thDepGlob ) === -1) {

                  copyFolderRecursiveSync(thDep, globalXer);

                  deleteFolderRecursive(thDep);

                  next()

                } else next()

              } else {

                if ( !fs.existsSync( main.thDepGlob ) ) {
                  fs.mkdirSync( main.thDepGlob );
                }

                copyFolderRecursiveSync(thDep, thDepGlob);

                deleteFolderRecursive(thDep);

                next()

              }

            })

          }, function(thErr) {

            if(thErr) console.error("Error!", thErr);

            deleteFolderRecursive(npm.prefix + "\\node_modules\\");

            console.log("\n Done")

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

            if (!err && npm.config.get('ham-it-up') && !npm.config.get('json') && !npm.config.get('parseable') && npm.command !== 'completion') {
              output('\n 🎵 I Have the Honour to Be Your Obedient Servant,🎵 ~ npm 📜🖋\n')
            }

            errorHandler.apply(this, arguments)

          })

        })

      } else {

        if (!err && npm.config.get('ham-it-up') && !npm.config.get('json') && !npm.config.get('parseable') && npm.command !== 'completion') {
              output('\n 🎵 I Have the Honour to Be Your Obedient Servant,🎵 ~ npm 📜🖋\n')
            }

        errorHandler.apply(this, arguments)

      }

    })
  })
})()
