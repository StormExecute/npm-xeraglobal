import nodePath = require("path");
import fs = require("fs");

import homeDir from "../getHomeDir";

import npmxSign from "./_sign";
import contentHasNPMXModify from "../contentHasNPMXModify";

const pattern: RegExp = /\[['"]node_modules['"]\]/;

export = ["gulp", function () {

	const liftoffPath = nodePath.join( this.npmModulePath, "./node_modules/liftoff/index.js" );

	const origContent = fs.readFileSync(liftoffPath).toString();

	if(!contentHasNPMXModify(origContent)) {

		let liftoff = origContent;

		if(!origContent.includes("if(fs.existsSync(") || !origContent.includes(".node_modules")) { // !!|| !&&

			let support = 'if(fs.existsSync("' + nodePath.join( homeDir, "./.node_modules/gulp/index.js" ) + '")) modulePath = "' + nodePath.join( homeDir, "./.node_modules/gulp/index.js" ) + '";\n\telse modulePath = resolve.sync(this.moduleName, { basedir: configBase || cwd, paths: paths });';

			liftoff = liftoff.replace(/modulePath(\s)?=(\s)?r.+;/, support)

		}

		if(!origContent.match(/require\(['"]fs['"]\)/)) {

			liftoff = liftoff.replace(/(var|const|let) path(\s)?=(\s)?require(\s)?\(['"]path['"]\);/, "var path = require('path');\nvar fs = require('fs');")

		}

		if(origContent != liftoff) {

			fs.unlinkSync(liftoffPath);

			fs.writeFileSync( liftoffPath, npmxSign + liftoff );

		}

	}

}];