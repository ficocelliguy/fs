const {cliCollisionPackages, nodeDefaultPackages, color} = require("./util/const");
const {run} = require("./util/run");
const DAY_IN_MS = 1000 * 60 * 60 * 24
const FRESH_THRESHOLD = DAY_IN_MS * 365 * 2;
const STALE_THRESHOLD = DAY_IN_MS * 365 * 4;

const getDependencies = (all, recursive) => {
    const result = run(`npm ls --json ${recursive ? "--all" : ""}`)
    const commonPackages = cliCollisionPackages.concat(nodeDefaultPackages);

    return Object.keys(result?.dependencies || {}).filter(d => {
        const npmInternal = d.match(/(@npm|^npm-)/i);
        const shouldBeChecked = all ? true : commonPackages.includes(d)
        return !npmInternal && shouldBeChecked
    });
}

const getDependencyUpdateTimes = (dependencies) => {
    const modifiedDateDependencies = [];
    for (let i = 0; i < dependencies.length; i++) {
        const framework = dependencies[i];
        printProgress(i +1, dependencies.length);
        const data = run(`npm view ${framework} --json`);
        const latest = data?.["dist-tags"]?.latest;
        const modified = data?.time?.[latest]
        modifiedDateDependencies.push({
            name: framework,
            modified: modified
        })
    }

    console.log("")

    return modifiedDateDependencies;

}

const formatTimeSince = (msTimeSinceUpdate) => {
    const days = msTimeSinceUpdate / DAY_IN_MS;
    const months = Math.floor( (days % 365) / 30);
    const years = Math.floor(days / 356);

    return `${format(years, " year")}${format(months, " month")}`;
}

const format = (num, label) => num ? `${num}${label}${num > 1 ? "s" : ""} ` : ""

const auditFs = () =>
    run(
        'npm ls fs',
        false, true
    );

const checkForOutdatedDependencies = (dependencies) => {
    console.log(`Found ${dependencies.length} target dependencies to age-check.`)

    const updates = getDependencyUpdateTimes(dependencies);
    const defaultPackages = updates.filter(d => nodeDefaultPackages.includes(d.name))
    const cliPackages = updates.filter(d => cliCollisionPackages.includes(d.name))
    const other = updates.filter(d => !nodeDefaultPackages.includes(d.name) && !cliCollisionPackages.includes(d.name))

    if (defaultPackages.length) {
        console.log("These npm packages already come by default with NodeJS, and they have not been updated in some time in npm:")
        printFrameworkAges(defaultPackages);
    }
    if (cliPackages.length) {
        console.log("These npm packages may have been installed by mistake, as their name is the same as npm cli command, and they have not been updated in some time:")
        printFrameworkAges(cliPackages);
    }
    if (other.length) {
        console.log("These npm packages have not been updated in some time:")
        printFrameworkAges(other);
    }

}

const printFrameworkAges = (frameworkUpdates) => {
    for (const framework of frameworkUpdates) {
        const timeSinceUpdate = (Date.now() - new Date(framework.modified));
        const name = `${color.FgCyan}${framework.name}${color.Reset}:`
        if (timeSinceUpdate > STALE_THRESHOLD) {
            console.log(`${name} ${color.Bright}${color.FgRed}${formatTimeSince(timeSinceUpdate)}${color.Reset}`);
        } else if (timeSinceUpdate > FRESH_THRESHOLD) {
            console.log(`${name} ${color.Bright}${color.FgYellow}${formatTimeSince(timeSinceUpdate)}${color.Reset}`);
        }
    }
}

function printProgress(current, max){
    process.stdout.cursorTo(0);
    process.stdout.write(`Checking for abandoned frameworks, ${current} / ${max} ...           `);
}

const main = (all = false, recursive = false) => {
    const dependencies = getDependencies(all, recursive);
    checkForOutdatedDependencies(dependencies);
    if (dependencies.includes("fs")) {
        auditFs();
    }
}

module.exports = main;