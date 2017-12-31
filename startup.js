const shell = require("shelljs");
const config = require("./configs.json");
const fs = require("fs");
let finished = 0;

const startup_script = function() {
    return new Promise((resolve) => {
        Object.keys(config.apps).forEach((app) => {
            const configs = config.apps[app];
            if(!fs.existsSync(configs.path)) {
                shell.mkdir(configs.path);
                shell.cd(configs.path);
                shell.exec(`git clone ${configs.git} ${configs.path}`);
                shell.exec(`git fetch`);
                shell.exec(`git checkout master`);
            }
            finished++;
            if(done()) {
                resolve();
            }
        })
    });
}

function done() {
    if(Object.keys(config.apps).length === finished) {
        shell.exec(`pm2 startOrRestart ${config.pm2_path}`);
        return true;
    }
    return false;
}

module.exports = startup_script();