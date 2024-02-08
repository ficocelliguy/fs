const {cliCollisionPackages, nodeDefaultPackages} = require("./util/const");
const {run} = require("./util/run");
const DAY_IN_MS = 1000 * 60 * 60 * 24
const FRESH_THRESHOLD = DAY_IN_MS * 365 * 3;

const getDependencies = () => {
    const result = run('npm ls -json')

    const dependencies = Object.keys(result?.dependencies || {}).filter(d => !d.match(/(@npm|^npm-)/i));
    console.log(dependencies);
    return dependencies;
}

const getDependencyUpdateTimes = (dependencies) => {
    const modifiedDateDependencies = [];
    for (let i = 0; i < dependencies.length; i++) {
        const framework = dependencies[i];
        printProgress(i +1, dependencies.length);
        const data = run(`npm view ${framework} -json`);
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

    return `${format(years, " year")}${format(months, " month", false)}`;
}

const format = (num, label, comma=true) => num ? `${num}${label}${num > 1 ? "s" : ""}${comma ? ",":""} ` : ""

const auditFs = () =>
    run(
        'npm ls fs',
        false, true
    );

const checkForOutdatedDependencies = () => {
    const dependencies = getDependencies();
    const updates = getDependencyUpdateTimes(dependencies);

    for (const framework of updates) {
        const timeSinceUpdate = (Date.now() - new Date(framework.modified));
        if (timeSinceUpdate > FRESH_THRESHOLD) {
            console.log(`${framework.name}: ${formatTimeSince(timeSinceUpdate)}`);
        } else {
            console.log(`${framework.name}: Still alive!`)
        }
    }
}

function printProgress(current, max){
    process.stdout.cursorTo(0);
    process.stdout.write(`Checking for abandoned frameworks, ${current} / ${max} ...           `);
}

const main = () => {
    checkForOutdatedDependencies();
    //auditFs();
}

main();