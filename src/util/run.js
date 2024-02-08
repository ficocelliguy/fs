const { execSync } = require('child_process');

const run = (cmd, json = true, stdoutLogging = false) => {
    try {
        const result = execSync(cmd,
            stdoutLogging ? {stdio: 'inherit'} : {})

        return result && json ? JSON.parse(result.toString()) : result;
    } catch(e) {
        console.log(e)
    }
}

module.exports = {
    run
}