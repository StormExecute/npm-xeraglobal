const { exec } = require("child_process");

const fs = require("fs");
const nodePath = require("path");

const parse = (objects, path, finalCallback) => {

	for(let i = 0; i < objects.length; ++i) {

		const object = nodePath.join( path, objects[i] );

		if(fs.lstatSync(object).isDirectory()) {

			parse( fs.readdirSync( object ), object );

		} else {

			const content = fs.readFileSync(object).toString();

			fs.writeFileSync(object, content.replace(/\.default/g, ""));

		}

	}

	if(typeof finalCallback == "function") finalCallback();

};

exec("tsc", (error, stderr) => {

	if(stderr) {

		console.log(stderr);

		return;

	}

	console.log("TSC: Done!")

	const path = nodePath.join( __dirname, "./dist" );

	parse( fs.readdirSync( path ) , path, () => {

		console.log("PostCompile: Done!");

	});

});