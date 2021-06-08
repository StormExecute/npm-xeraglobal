import { existsSync, writeFileSync } from "fs";
import { join } from "path";

type anyObjectT = { [key: string]: any };

import readPackage from "../readPackage";
import findCorePath from "../findCorePath";

import createDefaultPackageJsonIfNotExists from "../createPackageJsonIfNotExists";

import npmXerLog from "../xerLog";
import homeDir from "../getHomeDir";

const upDeleteCommands = ["d", "null", "r", "rm", "remove", "delete", "rmv", "dlt", "dl", "del"];
const upReverseCommands = ["rv", "reverse", "rvs", "rvrs"];
const upSortCommands = ["s", "sort", "srt", "st"];

export = (flags: anyObjectT, objects: string[]): void => {

	npmXerLog("Starting updating of package.json!");

	const dependencyName: string = flags.hasOwnProperty("sd") ? "devDependencies" : "dependencies";
	const oppositeDependencyName: string = dependencyName == "dependencies" ? "devDependencies" : "dependencies";

	const corePath: string = findCorePath();
	const packagePath: string = join(corePath, "package.json");

	const testPackage = createDefaultPackageJsonIfNotExists(corePath);

	const packageContent: anyObjectT = testPackage ? testPackage : readPackage( packagePath );

	if(!packageContent[dependencyName]) packageContent[dependencyName] = {};

	if(~upReverseCommands.indexOf(objects[0])) {

		const dependencies = Object.assign({}, packageContent.dependencies)
		const devDependencies = Object.assign({}, packageContent.devDependencies)

		packageContent.dependencies = devDependencies;
		packageContent.devDependencies = dependencies;

	} else if(~upSortCommands.indexOf(objects[0])) {

		["dependencies", "devDependencies"].forEach(dep => {

			packageContent["_" + dep] = Object.assign({}, packageContent[dep])

			const sort = Object.keys(packageContent[dep]).sort((a, b) => {
				const x = a.toLowerCase()
				const y = b.toLowerCase()
				return x < y ? -1 : x > y ? 1 : 0;
			})

			packageContent[dep] = {}

			for(let i = 0; i < sort.length; ++i) {

				packageContent[dep][sort[i]] = packageContent["_" + dep][sort[i]];

			}

			delete packageContent["_" + dep]

		})

	} else {

		let isRemovingDependencies = false;

		if(~upDeleteCommands.indexOf(objects[0])) {

			objects = objects.slice(1);

			isRemovingDependencies = true;

		}

		const globalXerPath = join(homeDir, "./.node_modules");

		for (let i = 0; i < objects.length; ++i) {

			const pkgName = objects[i];

			if (!pkgName) continue;

			if (isRemovingDependencies) {

				delete packageContent[dependencyName][pkgName]

				continue;

			}

			const xerModulePath = join(globalXerPath, pkgName);

			if (!existsSync(xerModulePath)) {

				npmXerLog("The module " + pkgName + " not found in " + globalXerPath);

			}

			const xerPackage = readPackage(join(xerModulePath, "package.json"));

			packageContent[dependencyName][pkgName] = "^" + xerPackage.version;

			if (packageContent[oppositeDependencyName] && packageContent[oppositeDependencyName][pkgName]) {

				delete packageContent[oppositeDependencyName][pkgName];

			}

		}

	}

	packageContent.__modifiedBy = "npm-xeraglobal@" + readPackage( join( __dirname, "../../../package.json" ) ).version;

	writeFileSync(packagePath, JSON.stringify(packageContent, null, '\t'));

	npmXerLog("Done!");

};