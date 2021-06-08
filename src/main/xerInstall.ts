import nodePath = require("path");
import fs = require("fs");

type anyObjectOrFnT = { (...args: any): any; [key: string]: any };
type anyObjectT = { [key: string]: any };

import * as platform from "../getPlatform";
import * as homeDir from "../getHomeDir";
import * as npmLibPath from "../getNPMPaths";

const npmModulesPaths: string[] = Object.assign([], require("../getNPMModulesPaths"));

const $tempProcessOn: typeof process.on = process.on;
// @ts-ignore
process.on = () => {};

const npm: anyObjectOrFnT = require(nodePath.join( npmLibPath, npmModulesPaths.shift() ));

let globalNpmPath: string;

if(platform == "w") {

	globalNpmPath = nodePath.join(process.env.APPDATA, "./npm/node_modules");

} else if(process.execPath.includes(".nvm")) {

	globalNpmPath = nodePath.join(process.execPath, "../../lib/node_modules");

} else {

	globalNpmPath = "/usr/lib/node_modules";

}

const npmConf: anyObjectOrFnT = require(nodePath.join( npmLibPath, npmModulesPaths.shift() ));
const npmErrorHandler: anyObjectOrFnT = require(nodePath.join( npmLibPath, npmModulesPaths.shift() ));

process.on = $tempProcessOn;

const nopt: anyObjectOrFnT = require(nodePath.join( npmLibPath, npmModulesPaths.shift() ));
const rimraf: anyObjectOrFnT = require(nodePath.join( npmLibPath, npmModulesPaths.shift() ));

import xerLinking from "../xerLinking";
import writeSupport from "../writeSupport";

// @ts-ignore
import * as readPackage from "../readPackage";

import createDefaultPackageJsonIfNotExists from "../createPackageJsonIfNotExists";
import npmXerLog from "../xerLog";

class xerInstall {

	private readonly flags: anyObjectT;
	private readonly finalCallback: () => any;
	private readonly isLocal: boolean;

	private objects: string[];
	private object: string;
	private objectVersion: string;

	private realModuleName: string;
	private isScopedModule: boolean;

	private projectDirectory: string;

	private readonly globalXerPath: string;

	private xerModulePath: string;
	private npmModulePath: string;

	public npmErrorHandler: anyObjectOrFnT = npmErrorHandler;

	setDefaultProcessArgv(): void {

		process.argv = [process.execPath, nodePath.join( npmLibPath, "../bin/npm-cli.js" ), "install"];

	}

	constructor(flags: anyObjectT, objects: string[], finalCallback?: (this: xerInstall) => any, isLocal?: boolean) {

		this.flags = flags;
		this.objects = objects;
		this.finalCallback = typeof finalCallback === "function" ? finalCallback : () => npmErrorHandler(0);
		this.isLocal = !!isLocal;

		this.globalXerPath = nodePath.join( homeDir, "./.node_modules" );

		if(!fs.existsSync(this.globalXerPath)) {

			fs.mkdirSync(this.globalXerPath);

		}

		this.installUserModules();

		return this;

	}

	defineRealModuleName(): string {

		const objectSplittedAt: string[] = this.object.split("@");
		const objectStartsWithAt: boolean = this.object[0] === "@";

		//@babel/core@version
		if(objectStartsWithAt && objectSplittedAt.length == 3) {

			//scoped package with version: @author/package@version

			//["", "babel/core", "version"]

			this.isScopedModule = true;

			return "@" + objectSplittedAt[1];

		} else if(objectStartsWithAt) {

			//scoped package: @author/package

			this.isScopedModule = true;

			return this.object;

		} else if(!objectStartsWithAt && this.object.includes("@")) {

			//package with version: package@version

			return objectSplittedAt[0];

		}

		//usually package

		return this.object;

	}

	installUserModules(): void {

		if(!this.objects.length) return this.finalCallback.call(this);

		this.isScopedModule = false;

		this.object = this.objects.shift();
		this.realModuleName = this.defineRealModuleName();

		this.xerModulePath = nodePath.join( this.globalXerPath, this.realModuleName );
		this.npmModulePath = nodePath.join( globalNpmPath, this.realModuleName );

		this.setDefaultProcessArgv();

		process.argv.push(this.object);

		if(!this.isLocal) {

			process.argv.push("--global");

		}

		const configDefs = npmConf.defs;
		const conf = nopt(configDefs.types, configDefs.shorthands);

		npm.argv = [this.object];
		npm.command = "install";

		conf._exit = true;

		npm.load(conf, err => {

			if (err) return npmErrorHandler(err);

			this.projectDirectory = this.flags.hasOwnProperty("utd") ? process.cwd() : npm.localPrefix;

			npm.commands[npm.command](npm.argv, err => {

				if(!err) {

					if(!this.isLocal) {

						return this.xerInstall();

					} else {

						return this.finalCallback.call(this);

					}

				}

				npmErrorHandler.apply(this, arguments);

			});

		});

	}

	xerInstall(): void {

		npmXerLog("Start copying to " + this.xerModulePath);

		const testPackage = createDefaultPackageJsonIfNotExists( this.npmModulePath );

		const npmPackage = testPackage ? testPackage : readPackage( nodePath.join( this.npmModulePath, "package.json" ) );
		this.objectVersion = npmPackage.version;

		if( fs.existsSync(this.xerModulePath) ) {

			const xerPackage = readPackage( nodePath.join( this.xerModulePath, "package.json" ) );

			if(!xerPackage.version || !npmPackage.version || xerPackage.version != npmPackage.version) {

				rimraf.sync(this.xerModulePath);

				fs.mkdirSync(this.xerModulePath, { recursive: true });

				xerLinking( this.npmModulePath, this.xerModulePath );

			}

		} else {

			fs.mkdirSync(this.xerModulePath, { recursive: true });

			xerLinking( this.npmModulePath, this.xerModulePath );

		}

		writeSupport.call(this, this.realModuleName);

		if(this.flags.hasOwnProperty("dt")) {

			this.deleteTrashAction();

		}

		if(!this.flags.hasOwnProperty("ns")) {

			this.writeDependencies();

		}

		npmXerLog("DONE!");

		return this.installUserModules();

	}

	writeDependencies(): void {

		const dependencyName = this.flags.hasOwnProperty("sd") ? "devDependencies" : "dependencies";

		const projectPackagePath = nodePath.join( this.projectDirectory, "package.json" );

		const projectPackage = readPackage( projectPackagePath );

		if(!projectPackage[dependencyName]) projectPackage[dependencyName] = {};

		projectPackage[dependencyName][this.realModuleName] = "^" + this.objectVersion;

		projectPackage.__modifiedBy = "npm-xeraglobal@" + readPackage( nodePath.join( __dirname, "../../../package.json" ) ).version;

		fs.writeFileSync(projectPackagePath, JSON.stringify(projectPackage, null, '\t'));

	}

	deleteTrashAction(): void {

		const trashFolders: string[] = [

			".idea",
			".git",
			".github",
			"example",
			"examples",
			"test",
			"tests",

		];

		const trashFiles: string[] = [

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

		const trashFilesUpperCase: string[] = [

			"Make",
			"Makefile",
			"Rakefile",

		];

		trashFolders.concat(trashFiles).concat(trashFilesUpperCase).forEach(trash => {

			const trashPath: string = nodePath.join( this.xerModulePath, trash );

			if(fs.existsSync(trashPath)) {

				rimraf.sync(trashPath);

			}

		});

	}

}

export = xerInstall;