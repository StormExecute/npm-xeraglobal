import { existsSync, writeFileSync } from "fs";
import { basename, join } from "path";

type anyObjectT = { [key: string]: any };

import defaultPackage from "./defaultPackageJsonIfNotExists";

export = (path: string): boolean | anyObjectT => {

	if(!existsSync(path)) {

		const dP = defaultPackage( basename(path) );

		writeFileSync(
			join(path, "package.json"),
			JSON.stringify(dP, null, "\t")
		);

		return dP;

	}

	return false;

};