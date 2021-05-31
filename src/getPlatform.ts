let platform: "w" | "l" = "l";

if(process.platform.startsWith("win")) {

	platform = "w";

} else if(process.platform.includes("linux")) {} else {

	throw new Error("This platform is not supported!");

}

export = platform;