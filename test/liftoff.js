const fs = require('fs')

let liftoffPath = "C:\\Users\\Ghost\\AppData\\Roaming\\npm\\node_modules\\gulp\\node_modules\\liftoff\\index.js"
				
const origLiftoff = fs.readFileSync(liftoffPath).toString()

fs.writeFileSync(liftoffPath, origLiftoff.replace(/modulePath(\s)?=(\s)?r.+;/, 'modulePath = process.env.USERPROFILE + "\\\\.node_modules\\\\gulp\\\\index.js"'))