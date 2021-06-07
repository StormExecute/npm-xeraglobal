import { exec } from "child_process";

export = (command: string, callback: (code: number) => void): void => {

	const npm = exec(command);

	npm.stdout.on("data", function (data) {

		data = data.toString();

		if(data == "\n") return;

		data = data.replace(/\n$/, "");

		console.log(data);

	});

	npm.stderr.on("data", function (data) {

		data = data.toString();

		console.error("\x1b[31m%s\x1b[0m", data)

	});

	npm.on('close', callback);

};