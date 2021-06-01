import fs from "fs";

export = (path: string): any => JSON.parse( fs.readFileSync(path).toString() );