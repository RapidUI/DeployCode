const shell = require("shelljs");
const config = require("./configs.json");
const fs = require("fs");
let started = 0;
let finished = 0;

const startup_script = function() {
    return new Promise((resolve) => {
        Object.keys(config.apps).forEach((app) => {
            const configs = config.apps[app];
            started++;
            if(!fs.existsSync(configs.path)) {
                shell.mkdir(configs.path);
                shell.cd(configs.path);
                shell.exec(`git clone ${configs.git} ${configs.path}`);
                shell.exec(`git fetch`);
                shell.exec(`git checkout ${branch}`);
            }
            finished++;
            if(done()) {
                resolve();
            }
        })
    });
}

function done() {
    if(started === finished) {
        shell.exec(`pm2 startOrRestart ${config.pm2_path}`);
        return true;
    }
    return false;
}

module.exports = startup_script();