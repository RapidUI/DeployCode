const express = require("express");
const app = express();
const shell = require("shelljs");
const config = require("./configs.json");
const fs = require("fs");
app.get("/update", (req, res) => {
    let { app, branch = "master" } = req.query;
    const configs = config.apps[app];
    if(!configs) {
        res.send("not possible to update this app. doesn't exist");
        res.end();
    } else {
        const pm2File = JSON.parse(fs.readFileSync("./pm2.json", "utf8"));
        const filtered = pm2File.apps.filter((cApp) => cApp.name === app);
        if(filtered.length === 0) {
            pm2File.apps.push({
                name: app,
                scripts:`${configs.path}/index.js`,
                watch: true
            });
        }
        shell.rm("./pm2.json");
        fs.writeFileSync("./pm2.json", JSON.stringify(pm2File));
        shell.exec(`git add .`);
        shell.exec(`git commit -m "updating pm2.json file"`);
        shell.exec(`git push`);        
        if(!fs.existsSync(configs.path)) {
            shell.mkdir(configs.path);
            shell.cd(configs.path);
            shell.exec(`git clone ${configs.git} ${configs.path}`);
            shell.exec(`git fetch`);
            shell.exec(`git checkout ${branch}`);
        } else {
            shell.cd(configs.path);
            shell.exec("git reset --hard");
            shell.exec(`git checkout ${branch}`);
            shell.exec(`git pull ${branch}`);
        }
        shell.exec(`pm2 reload ./pm2.json`);
        res.send("your new change is done");
        res.end();
    }
});

app.listen(3000);