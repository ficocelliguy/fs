#! /usr/bin/node
const checkDependencies = require("./src/check.js");
const arg = (a) => process.argv.includes(a)

;(async () => {
    const recursive = arg("-r") || arg("--recursive");
    const all = arg("-a") || arg("--all") || recursive;

    checkDependencies(all, recursive);

    process.exit()
})()