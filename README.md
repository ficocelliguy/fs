# Framework Staleness Utility
Identify stale or abandoned dependencies in your projects, or libraries installed by mistake.

![image](https://github.com/ficocelliguy/fs/assets/1338468/30e2cdfb-8cc9-4a2a-ac43-b6a1a48494e7)


### Usage

Install with `npm i -D https://github.com/ficocelliguy/stale-check`

Check for the most common out-of-maintenance or stale frameworks with
`npx stale-check`

To check all of your projects' immediate dependencies for any that have not been updated in years, use 
`npx stale-check -a`

To check dependencies recursively, use `npx stale-check -r`

Note that using both flags `-a -r` may take some time to run.
