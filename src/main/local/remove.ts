type anyObjectT = { [key: string]: any };

import standart from "./standard";

import localStream from "./stream";
import localHandler from "./handler";

import npmXerLog from "../../xerLog";

export = (flags: anyObjectT, objects: string[]): void => {

	npmXerLog("Starting local uninstall...");

	localStream("npm uninstall " + objects.join(" "), localHandler(standart()));

};