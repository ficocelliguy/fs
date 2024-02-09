#! /usr/bin/node
const { execSync } = require('child_process');

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

const auditFs = (dependencies) => {
    console.log("")
    if (dependencies.includes("fs")) {
        console.log("The fs package is included in your project's dependencies directly.")
        console.log("(If you wanted the node fs library, it is already built-in to node.)")
    } else {
        console.log("This is why the fs package is included in your project:")
        run(
            'npm ls fs',
            false, true
        );
    }
}

const checkForOutdatedDependencies = (dependencies) => {
    console.log(`Found ${dependencies.length} target dependencies to age-check.`)

    const updates = getDependencyUpdateTimes(dependencies);
    const defaultPackages = updates.filter(d => nodeDefaultPackages.includes(d.name))
    const cliPackages = updates.filter(d => cliCollisionPackages.includes(d.name))
    const other = updates.filter(d => !nodeDefaultPackages.includes(d.name) && !cliCollisionPackages.includes(d.name))

    if (defaultPackages.length) {
        console.log("")
        console.log("These libraries already come by default with NodeJS.")
        console.log("The npm packages with similar names have not been updated in some time:")
        printFrameworkAges(defaultPackages);
    }
    if (cliPackages.length) {
        console.log("")
        console.log("These npm packages may have been installed by mistake. They have not been updated in some time:")
        printFrameworkAges(cliPackages);
    }
    if (other.length) {
        console.log("")
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

const run = (cmd, json = true, stdoutLogging = false) => {
    try {
        const result = execSync(cmd,
            {
                encoding : 'utf8',
                ...(stdoutLogging ? {stdio: 'inherit'} : {})
            })

        return result && json ? JSON.parse(result.toString()) : result;
    } catch(e) {
        console.log(e)
    }
}

const main = (all = false, recursive = false) => {
        const dependencies = getDependencies(all, recursive);
        checkForOutdatedDependencies(dependencies);
        auditFs(dependencies);
    }

const arg = (a) => process.argv.includes(a)

const cliCollisionPackages = [
    'access','adduser','audit','bugs','cache','ci','completion','config','dedupe','deprecate','diff','dist-tag','docs','doctor','edit','exec','explain','explore','find-dupes','fund','help','help-search','hook','init','install','install-ci-test','install-test','link','login','logout','ls','org','outdated','owner','pack','ping','pkg','prefix','profile','prune','publish','query','rebuild','repo','restart','root','run-script','sbom','search','shrinkwrap','star','stars','start','stop','team','test','token','uninstall','unpublish','unstar','update','version','view','whoami','save', 'save-exact', 'save-dev', 'global', 'install-strategy', 'legacy-bundling', 'global-style', 'omit', 'include', 'strict-peer-deps', 'prefer-dedupe', 'package-lock', 'package-lock-only', 'foreground-scripts', 'ignore-scripts', 'audit', 'bin-links', 'fund', 'dry-run', 'cpu', 'os', 'libc', 'workspace', 'workspaces', 'include-workspace-root', 'install-links', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','ls', 'ps', 'pwd', 'cwd', 'rm', 'mv', 'makedir', 'cd', 'cat', 'tail', 'man', 'chmod', 'kill', 'grep', 'find', 'gzip', 'npmrc', 'bashrc',
    'aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al','am','an','ao','ap','aq','ar','as','at','au','av','aw','ax','ay','az','ba','bb','bc','bd','be','bf','bg','bh','bi','bj','bk','bl','bm','bn','bo','bp','bq','br','bs','bt','bu','bv','bw','bx','by','bz','ca','cb','cc','cd','ce','cf','cg','ch','ci','cj','ck','cl','cm','cn','co','cp','cq','cr','cs','ct','cu','cv','cw','cx','cy','cz','da','db','dc','dd','de','df','dg','dh','di','dj','dk','dl','dm','dn','do','dp','dq','dr','ds','dt','du','dv','dw','dx','dy','dz','ea','eb','ec','ed','ee','ef','eg','eh','ei','ej','ek','el','em','en','eo','ep','eq','er','es','et','eu','ev','ew','ex','ey','ez','fa','fb','fc','fd','fe','ff','fg','fh','fi','fj','fk','fl','fm','fn','fo','fp','fq','fr','fs','ft','fu','fv','fw','fx','fy','fz','ga','gb','gc','gd','ge','gf','gg','gh','gi','gj','gk','gl','gm','gn','go','gp','gq','gr','gs','gt','gu','gv','gw','gx','gy','gz','ha','hb','hc','hd','he','hf','hg','hh','hi','hj','hk','hl','hm','hn','ho','hp','hq','hr','hs','ht','hu','hv','hw','hx','hy','hz','ia','ib','ic','id','ie','if','ig','ih','ii','ij','ik','il','im','in','io','ip','iq','ir','is','it','iu','iv','iw','ix','iy','iz','ja','jb','jc','jd','je','jf','jg','jh','ji','jj','jk','jl','jm','jn','jo','jp','jq','jr','js','jt','ju','jv','jw','jx','jy','jz','ka','kb','kc','kd','ke','kf','kg','kh','ki','kj','kk','kl','km','kn','ko','kp','kq','kr','ks','kt','ku','kv','kw','kx','ky','kz','la','lb','lc','ld','le','lf','lg','lh','li','lj','lk','ll','lm','ln','lo','lp','lq','lr','ls','lt','lu','lv','lw','lx','ly','lz','ma','mb','mc','md','me','mf','mg','mh','mi','mj','mk','ml','mm','mn','mo','mp','mq','mr','ms','mt','mu','mv','mw','mx','my','mz','na','nb','nc','nd','ne','nf','ng','nh','ni','nj','nk','nl','nm','nn','no','np','nq','nr','ns','nt','nu','nv','nw','nx','ny','nz','oa','ob','oc','od','oe','of','og','oh','oi','oj','ok','ol','om','on','oo','op','oq','or','os','ot','ou','ov','ow','ox','oy','oz','pa','pb','pc','pd','pe','pf','pg','ph','pi','pj','pk','pl','pm','pn','po','pp','pq','pr','ps','pt','pu','pv','pw','px','py','pz','qa','qb','qc','qd','qe','qf','qg','qh','qi','qj','qk','ql','qm','qn','qo','qp','qq','qr','qs','qt','qu','qv','qw','qx','qy','qz','ra','rb','rc','rd','re','rf','rg','rh','ri','rj','rk','rl','rm','rn','ro','rp','rq','rr','rs','rt','ru','rv','rw','rx','ry','rz','sa','sb','sc','sd','se','sf','sg','sh','si','sj','sk','sl','sm','sn','so','sp','sq','sr','ss','st','su','sv','sw','sx','sy','sz','ta','tb','tc','td','te','tf','tg','th','ti','tj','tk','tl','tm','tn','to','tp','tq','tr','ts','tt','tu','tv','tw','tx','ty','tz','ua','ub','uc','ud','ue','uf','ug','uh','ui','uj','uk','ul','um','un','uo','up','uq','ur','us','ut','uu','uv','uw','ux','uy','uz','va','vb','vc','vd','ve','vf','vg','vh','vi','vj','vk','vl','vm','vn','vo','vp','vq','vr','vs','vt','vu','vv','vw','vx','vy','vz','wa','wb','wc','wd','we','wf','wg','wh','wi','wj','wk','wl','wm','wn','wo','wp','wq','wr','ws','wt','wu','wv','ww','wx','wy','wz','xa','xb','xc','xd','xe','xf','xg','xh','xi','xj','xk','xl','xm','xn','xo','xp','xq','xr','xs','xt','xu','xv','xw','xx','xy','xz','ya','yb','yc','yd','ye','yf','yg','yh','yi','yj','yk','yl','ym','yn','yo','yp','yq','yr','ys','yt','yu','yv','yw','yx','yy','yz','za','zb','zc','zd','ze','zf','zg','zh','zi','zj','zk','zl','zm','zn','zo','zp','zq','zr','zs','zt','zu','zv','zw','zx','zy','zz'
]

const nodeDefaultPackages = [
    'assert','dns','fs','inspector','internal','path','readline','stream','test','timers','util','.eslintrc.yaml','http_agent','http_client','http_common','http_incoming','http_outgoing','http_server','stream_duplex','stream_passthrough','stream_readable','stream_transform','stream_wrap','stream_writable','tls_common','tls_wrap','assert','async_hooks','buffer','child_process','cluster','console','constants','crypto','dgram','diagnostics_channel','dns','domain','events','fs','http','http2','https','inspector','module','net','os','path','perf_hooks','process','punycode','querystring','readline','repl','stream','string_decoder','sys','test','timers','tls','trace_events','tty','url','util','v8','vm','wasi','worker_threads','zlib'
]

const color = {
        Reset: '\x1b[0m',
        Bright: '\x1b[1m',

        FgRed: '\x1b[31m',
        FgGreen: '\x1b[32m',
        FgYellow: '\x1b[33m',
        FgBlue: '\x1b[34m',
        FgCyan: '\x1b[36m',
    }

;(async () => {
    const recursive = arg("-r") || arg("--recursive");
    const all = arg("-a") || arg("--all") || recursive;

    main(all, recursive);

    process.exit()
})()