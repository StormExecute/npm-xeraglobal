import { join } from "path";

type anyObjectT = { [key: string]: any };

import readPackage from "../../readPackage";
import findCorePath from "../../findCorePath";

import createDefaultPackageJsonIfNotExists from "../../createPackageJsonIfNotExists";

export = (): [string, anyObjectT, anyObjectT] => {

	const corePath: string = findCorePath();
	const packagePath: string = join(corePath, "package.json");

	const testPackage = createDefaultPackageJsonIfNotExists(corePath);

	const packageContent: anyObjectT = testPackage ? testPackage : readPackage(packagePath);

	const dependencies: anyObjectT = packageContent.dependencies || {};
	const devDependencies: anyObjectT = packageContent.devDependencies || {};

	return [packagePath, dependencies, devDependencies]

};