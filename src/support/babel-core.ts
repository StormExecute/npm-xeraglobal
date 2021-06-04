import nodePath = require("path");
import fs = require("fs");

import homeDir from "../getHomeDir";

import npmxSign from "./_sign";
import contentHasNPMXModify from "../contentHasNPMXModify";

const pattern: RegExp = /\[['"]node_modules['"]\]/;

export = ["@babel/core", function () {

	const resolvePath = nodePath.join( this.xerModulePath, "./node_modules/resolve" );

	//for older versions

	if(fs.existsSync(resolvePath)) {

		const nodeModulesPaths = nodePath.join(resolvePath, "./lib/node-modules-paths.js");

		const origContent = fs.readFileSync(nodeModulesPaths).toString();

		if (!contentHasNPMXModify(origContent)) {

			const support = `['node_modules', '${nodePath.join(homeDir, "./.node_modules")}']`;

			fs.unlinkSync(nodeModulesPaths);

			fs.writeFileSync(nodeModulesPaths, npmxSign + origContent.replace(pattern, support));

		}

	}

}];