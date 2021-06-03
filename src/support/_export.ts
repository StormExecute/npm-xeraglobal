import fs = require("fs");

const supportFiles = fs.readdirSync(__dirname);

//Array<[string | string[], Function]>
module.exports = [];

for (let i = 0; i < supportFiles.length; ++i) {

	const file = supportFiles[i];

	if (file[0] === "_") continue;

	const [ possibleModuleName, supportFunctionality ] = require( "./" + file );

	const resultModuleName: string | string[] = typeof possibleModuleName == "string" ? [possibleModuleName] : possibleModuleName;

	module.exports.push( [ resultModuleName, supportFunctionality ] );

}