const express = require("express");
const app = express();
const shell = require("shelljs");
const config = require("config.json");

app.get("update", (req, res) => {
    let { app, branch = "master" } = req.query;
    const configs = config.apps[app];
    if(!configs) {
        res.send("not possible to update this app. doesn't exist");
        res.end();
    } else {
        shell.cd(configs.path);
        shell.exec("git reset --hard");
        shell.exec(`git checkout ${branch}`);
        shell.exec(`git pull ${branch}`);
        shell.exec(`pm2 restart ${app}`);
        res.send("your new change is done");
        res.end();
    }
});

app.listen(3000);