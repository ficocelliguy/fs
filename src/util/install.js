const {cliCollisionPackages, nodeDefaultPackages} = require("./const");
const {run} = require("./run");

// Installs all potentially problem packages. Used only for testing.

const packages = cliCollisionPackages.concat(nodeDefaultPackages);

for (const pack of packages) {
    run(
        `npm i ${pack}`,
        false,
        true
    )
}

