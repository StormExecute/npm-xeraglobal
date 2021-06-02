const supportForModules: Array<[string | string[], Function]> = require("./support/_export");

export = function (moduleName: string): void {

	for (let i = 0; i < supportForModules.length; ++i) {

		const [ possibleModuleNames, supportFunctionality ] = supportForModules[i];

		if( ~possibleModuleNames.indexOf( moduleName ) ) {

			supportFunctionality.call(this);

		}

	}

}