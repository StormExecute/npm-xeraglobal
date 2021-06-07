import { writeFileSync } from "fs";

type anyObjectT = { [key: string]: any };

import readPackage from "../../readPackage";

import npmXerLog from "../../xerLog";

export = ([packagePath, dependencies, devDependencies]: [string, anyObjectT, anyObjectT]) => {

	return (code: number) => {

		npmXerLog("Running local permutation...");

		const newPackageContent: anyObjectT = readPackage( packagePath );

		const newDependencies: anyObjectT = newPackageContent.dependencies || {};
		const newDevDependencies: anyObjectT = newPackageContent.devDependencies || {};

		let wasModified: boolean = false;

		for(const prop in newDependencies) {

			if(!dependencies[prop] || dependencies[prop] !== newDependencies[prop]) {

				dependencies[prop] = newDependencies[prop];
				wasModified = true;

			}

		}

		for(const prop in newDevDependencies) {

			if(!devDependencies[prop] || devDependencies[prop] !== newDevDependencies[prop]) {

				devDependencies[prop] = newDevDependencies[prop];
				wasModified = true;

			}

		}

		if(wasModified) {

			newPackageContent.dependencies = dependencies;
			newPackageContent.devDependencies = devDependencies;

			writeFileSync(packagePath, JSON.stringify(newPackageContent, null, "\t"));

		}

		npmXerLog("Done!");

	};

};