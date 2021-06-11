import nodePath = require("path");
import fs = require("fs");

import homeDir from "../getHomeDir";

import npmxSign from "./_sign";
import contentHasNPMXModify from "../contentHasNPMXModify";

const pattern: RegExp = /\[['"]node_modules['"]\]/;

export = (modulePath): void => {

	const resolvePath = nodePath.join( modulePath, "./node_modules/resolve" );

	if(fs.existsSync(resolvePath)) {

		const nodeModulesPaths = nodePath.join(resolvePath, "./lib/node-modules-paths.js");

		const origContent = fs.readFileSync(nodeModulesPaths).toString();

		if (!contentHasNPMXModify(origContent)) {

			const support = `['node_modules', '${nodePath.join(homeDir, "./.node_modules")}']`;

			fs.unlinkSync(nodeModulesPaths);

			fs.writeFileSync(nodeModulesPaths, npmxSign + origContent.replace(pattern, support));

		}

	}

	const enhancedResolvePath = nodePath.join( modulePath, "./node_modules/enhanced-resolve" );

	if(fs.existsSync(enhancedResolvePath)) {

		const resolverFactoryPath = nodePath.join(enhancedResolvePath, "./lib/ResolverFactory.js");

		const origContent = fs.readFileSync(resolverFactoryPath).toString();

		if (!contentHasNPMXModify(origContent)) {

			const support = `['node_modules', '${nodePath.join(homeDir, "./.node_modules")}']`;

			fs.unlinkSync(resolverFactoryPath);

			fs.writeFileSync(resolverFactoryPath, npmxSign + origContent.replace(pattern, support));

		}

	}

	const liftoffPath = nodePath.join( modulePath, "./node_modules/liftoff/index.js" );

	if(fs.existsSync(liftoffPath)) {

		const origContent = fs.readFileSync(liftoffPath).toString();

		if (!contentHasNPMXModify(origContent)) {

			let liftoff = origContent;

			if (!origContent.includes("if(fs.existsSync(") || !origContent.includes(".node_modules")) { // !!|| !&&

				let support = 'if(fs.existsSync("' + nodePath.join(homeDir, "./.node_modules/gulp/index.js") + '")) modulePath = "' + nodePath.join(homeDir, "./.node_modules/gulp/index.js") + '";\n\telse modulePath = resolve.sync(this.moduleName, { basedir: configBase || cwd, paths: paths });';

				liftoff = liftoff.replace(/modulePath(\s)?=(\s)?r.+;/, support)

			}

			if (!origContent.match(/require\(['"]fs['"]\)/)) {

				liftoff = liftoff.replace(/(var|const|let) path(\s)?=(\s)?require(\s)?\(['"]path['"]\);/, "var path = require('path');\nvar fs = require('fs');")

			}

			if (origContent != liftoff) {

				fs.unlinkSync(liftoffPath);

				fs.writeFileSync(liftoffPath, npmxSign + liftoff);

			}

		}

	}

};