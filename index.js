const express = require("express");
const app = express();
const shell = require("shelljs");
const config = require("./configs.json");
const fs = require("fs");
require("./startup");
app.get("/update", (req, res) => {
    let { app, branch = "master" } = req.query;
    const configs = config.apps[app];
    if(!configs) {
        res.send("not possible to update this app. doesn't exist");
        res.end();
    } else {
        const pm2File = JSON.parse(fs.readFileSync(config.pm2_path, "utf8"));
        const filtered = pm2File.apps.filter((cApp) => cApp.name === app);
        if(filtered.length === 0) {
            pm2File.apps.push({
                name: app,
                script:`${configs.path}/index.js`,
                watch: true
            });
        }
        if(!fs.existsSync(configs.path)) {
            shell.mkdir(configs.path);
            shell.cd(configs.path);
            shell.exec(`git clone ${configs.git} ${configs.path}`);
            shell.exec(`git fetch`);
            shell.exec(`git checkout ${branch}`);
            console.log(`starting ${configs.path}/index.js with the name ${app}`);
            shell.exec(`pm2 start ${configs.path}/index.js --name=${app} --watch=true`);   
            shell.exec("pm2 save");         
            shell.rm(config.pm2_path);
            fs.writeFileSync(config.pm2_path, JSON.stringify(pm2File));
            shell.cd(config.apps.DeployCode.path);
            shell.exec(`git add .`);
            shell.exec(`git commit -m "updating pm2.json file"`);
            shell.exec(`git push`);
            shell.chmod(777, config.pm2_path);
        } else {
            shell.cd(configs.path);
            shell.exec("git reset --hard");
            shell.exec(`git checkout ${branch}`);
            shell.exec(`git pull`);
            shell.exec(`pm2 restart ${app}`);
        }
        res.send("your new change is done");
        res.end();
    }
});

app.listen(3000);

