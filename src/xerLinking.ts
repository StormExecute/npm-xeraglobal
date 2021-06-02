import fs = require("fs");
import nodePath = require("path");

const xerLinking = (source: string, target: string): void => {

	const files = fs.readdirSync( source );

	for (let i = 0; i < files.length; ++i) {

		const file = files[i];

		const filePath: string = nodePath.join( source, file );

		const targetPath: string = nodePath.join( target, file );

		if ( fs.lstatSync( filePath ).isDirectory() ) {

			fs.mkdirSync( targetPath );

			xerLinking( filePath, targetPath );

		} else {

			fs.symlinkSync( filePath, targetPath );

		}

	}

};

export = xerLinking;