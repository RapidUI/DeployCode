const shell = require("shelljs");
let config = require("./configs.json");
const fs = require("fs");
let finished = 0;

if(!fs.existsSync("/root/rapidui/DeployCode")) {
    shell.mkdir("/root/rapidui/DeployCode");
    shell.exec("git clone git@github.com:RapidUI/DeployCode.git /root/rapidui/DeployCode")
}
shell.cd("/root/rapidui/DeployCode");
shell.exec("git pull");
shell.exec(`git checkout master`);
config = JSON.parse(fs.readFileSync("/root/rapidui/DeployCode/configs.json", "utf-8"));

const startup_script = function() {
    return new Promise((resolve) => {
        Object.keys(config.apps).forEach((app) => {
            const configs = config.apps[app];
            if(!fs.existsSync(configs.path) && app !== "DeployCode") {
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
        shell.exec(`pm2 restart ${config.pm2_path}`);
        return true;
    }
    return false;
}

shell.

startup_script();