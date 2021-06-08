import nodePath = require("path");
import fs = require("fs");

import xerLinking from "../xerLinking";
import writeSupport from "../writeSupport";

import * as homeDir from "../getHomeDir";
import * as platform from "../getPlatform";
import * as npmLibPath from "../getNPMPaths";

type anyObjectOrFnT = { (...args: any): any; [key: string]: any };
type anyObjectT = { [key: string]: any };

import npmXerLog from "../xerLog";

const npm: anyObjectOrFnT = require( nodePath.join( npmLibPath, "./npm" ) );

let globalNpmPath: string;

if(platform == "w") {

	globalNpmPath = nodePath.join(process.env.APPDATA, "./npm/node_modules");

} else if(process.execPath.includes(".nvm")) {

	globalNpmPath = nodePath.join(process.execPath, "../../lib/node_modules");

} else {

	globalNpmPath = "/usr/lib/node_modules";

}

export = (flags: anyObjectT, objects: string[]): void => {

	npmXerLog("Start creating links in .node_modules...");

	const globalXerPath = nodePath.join(homeDir, "./.node_modules");

	if(!fs.existsSync(globalXerPath)) {

		fs.mkdirSync(globalXerPath);

	}

	for(let i = 0; i < objects.length; ++i) {

		const object: string = objects[i];

		if(object) {

			const xerModulePath = nodePath.join(globalXerPath, object);
			const npmModulePath = nodePath.join(globalNpmPath, object);

			if( fs.existsSync( xerModulePath ) ) continue;

			fs.mkdirSync(nodePath.join(globalXerPath, object));

			xerLinking(npmModulePath, xerModulePath);

			writeSupport.call({

				xerModulePath,
				npmModulePath,

			}, object);

		}

	}

	npmXerLog("Done!");

};