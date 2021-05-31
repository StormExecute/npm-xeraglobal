import platform from "./getPlatform";

if(platform == "w" && !process.env.USERPROFILE) {

	throw new Error("process.env.USERPROFILE is not defined!");

} else if(!process.env.HOME) {

	throw new Error("process.env.HOME is not defined!");

}

import nodePath = require("path");

const homeDir: string = process.env.USERPROFILE || ( process.env.SUDO_USER ? nodePath.join("/home/", process.env.SUDO_USER) : process.env.HOME );

export = homeDir;