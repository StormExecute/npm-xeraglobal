import nodePath = require("path");
import { execSync } from "child_process";

let paths: string = "";

if(process.platform.startsWith("win")) {

	paths = nodePath.join( execSync("where npm").toString().split("\r\n")[0], "../node_modules/npm/lib/" );

} else if(process.platform.includes("linux") && process.execPath.includes(".nvm")) {

	paths = nodePath.join( process.execPath, "../../lib/node_modules/npm/lib/" );

} else if(process.platform.includes("linux")) {

	paths = nodePath.join( process.execPath, "/usr/lib/node_modules/npm/lib/node_modules/npm/lib/" );

}

export = paths;