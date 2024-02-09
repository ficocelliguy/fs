# Framework Staleness Utility
Identify stale or abandoned dependencies in your projects, or libraries installed by mistake.

### Usage

Install with `npm i -D https://github.com/ficocelliguy/fs`

Check for the most common out-of-maintenance or stale frameworks with
`npx fs`

To check all of your projects' immediate dependencies for any that have not been updated in years, use 
`npx fs -a`

To check dependencies recursively, use `npx fs -r`

Note that using both flags `-a -r` may take some time to run.