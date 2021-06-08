import { join } from "path";
import fs = require("fs");

type anyObjectOrFnT = { (...args: any): any; [key: string]: any };
type anyObjectT = { [key: string]: any };

import * as npmLibPath from "../getNPMPaths";
import * as homeDir from "../getHomeDir";

import npmXerLog from "../xerLog";

const rimraf: anyObjectOrFnT = require( join( npmLibPath, "../node_modules/rimraf/rimraf.js" ) );

export = (flags: anyObjectT, objects: string[]): void => {

	npmXerLog("Start deleting links in .node_modules...");

	const globalXerPath = join(homeDir, "./.node_modules");

	if(!fs.existsSync(globalXerPath)) {

		fs.mkdirSync(globalXerPath);

	}

	for(let i = 0; i < objects.length; ++i) {

		const object: string = objects[i];

		if(object) {

			rimraf.sync(join(globalXerPath, object));

		}

	}

	npmXerLog("Done!");

};