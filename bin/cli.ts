#!/usr/bin/env node

import fargv from "fargv";

import { join } from "path";

import readPackage from "../src/readPackage";

import xerInstall from "../src/main/xerInstall";
import localInstall from "../src/main/local/install";

import link from "../src/main/link";
import unlink from "../src/main/unlink";

import up from "../src/main/up";
import remove from "../src/main/local/remove";

process.on("uncaughtException", err => {

	console.error("NPM-XERAGLOBAL-ERROR!", err);
	process.exit(1);

});

const mainInstallHandler = (installFunctionality: typeof xerInstall) => {

	return (argv, nextCommands: string[]) => {

		if(nextCommands.length && !!nextCommands[0]) {

			new installFunctionality(argv.flags, nextCommands);

		} else {

			throw new Error("Modules not defined!");

		}

	};

};

const upRemoveLocalHandler = (upFunctionality: typeof up | typeof remove | typeof localInstall) => {

	return (argv, nextCommands: string[]) => {

		if(nextCommands.length && !!nextCommands[0]) {

			upFunctionality(argv.flags, nextCommands);

		} else {

			throw new Error("Modules not defined!");

		}

	};

};

fargv
	.command("install", mainInstallHandler(xerInstall), {

		alias: "i",

	})
	.command("installLocal", upRemoveLocalHandler(localInstall), {

		alias: "il",

	})
	.command("up", upRemoveLocalHandler(up), {

		alias: ["xerup", "upxer", "uppackages"],

	})
	.command("remove", upRemoveLocalHandler(remove), {

		alias: ["r", "rm", "rem", "uninstall", "del", "dl", "d"],

	})
	.command("unlink", upRemoveLocalHandler(unlink), {

		alias: ["unl"]

	})
	.command("link", upRemoveLocalHandler(link), {

		alias: ["l", "lnk"]

	})
	.optionVersion( readPackage( join( __dirname, "../../package.json" ) ).version )
	.init({

		defaultArgv: {

			dt: [[undefined, "$notFill"], ["delete-trash"]],
			ns: [[undefined, "$notFill"], ["no-save"]],
			utd: [[undefined, "$notFill"], ["use-this-dir"]],
			sd: [[undefined, "$notFill"], ["save-dev", "D"]],
			as: [[undefined, "$notFill"], ["auto-support", "ass"]],
			asr: [[undefined, "$notFill"], ["auto-support-real", "real-ass"]],

		},
		nextCommandsAsArray: true,

	}, true);
