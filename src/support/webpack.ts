import nodePath = require( "path");
import fs = require( "fs");

import homeDir from "../getHomeDir";

import npmxSign from "./_sign";
import contentHasNPMXModify from "../contentHasNPMXModify";

const pattern: RegExp = /\[['"]node_modules['"]\]/;

export = [ ["webpack", "webpack-stream"], function () {

	const resolverFactoryPath = nodePath.join( this.xerModulePath, "./node_modules/enhanced-resolve/lib/ResolverFactory.js" );

	const origContent = fs.readFileSync(resolverFactoryPath).toString();

	if(!contentHasNPMXModify(origContent)) {

		const support = `['node_modules', '${ nodePath.join( homeDir, "./.node_modules" ) }']`;

		fs.unlinkSync(resolverFactoryPath);

		fs.writeFileSync( resolverFactoryPath, npmxSign + origContent.replace(pattern, support) );

	}

}];