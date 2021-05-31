import { existsSync } from "fs";
import { join } from "path";

const findCorePath = (path?: string, lastPath?: string): string => {

	const cwd = path || process.cwd();

	if( existsSync( join( cwd, "package.json" ) ) ) return cwd;

	const newPath = join(cwd, "..");

	if(newPath === lastPath) return process.cwd();

	return findCorePath(newPath, cwd);

};

export = findCorePath;