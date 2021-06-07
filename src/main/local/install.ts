type anyObjectT = { [key: string]: any };

import standart from "./standard";

import localStream from "./stream";
import localHandler from "./handler";

import npmXerLog from "../../xerLog";

export = (flags: anyObjectT, objects: string[]): void => {

	npmXerLog("Running local installation...");

	localStream("npm install " + objects.join(" "), localHandler(standart()));

};