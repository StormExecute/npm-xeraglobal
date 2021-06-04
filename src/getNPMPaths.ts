import nodePath = require("path");

let paths: string = "";

if(process.platform.startsWith("win")) {

	paths = nodePath.join( process.execPath, "../node_modules/npm/lib/" );

} else if(process.platform.includes("linux") && process.execPath.includes(".nvm")) {

	paths = nodePath.join( process.execPath, "../../lib/node_modules/npm/lib/" );

} else if(process.platform.includes("linux")) {

	paths = nodePath.join( process.execPath, "/usr/lib/node_modules/npm/lib/node_modules/npm/lib/" );

}

export = paths;