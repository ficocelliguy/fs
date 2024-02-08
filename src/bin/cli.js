#! /usr/bin/node
const checkDependencies = require("../check.js");

const arg = (a) => !!~process.argv.indexOf(a)

;(async () => {
    const all = arg("-a") || arg("--all");
    const recursive = arg("-r") || arg("--recursive");

    checkDependencies(all, recursive);
})()