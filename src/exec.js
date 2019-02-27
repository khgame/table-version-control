const Path = require('path')
const chalk = require('chalk')
const readline = require('readline')

const packageObj = require('../package.json')

const Yargs = require('yargs')
const argv = Yargs
    .usage('Usage: table-vc [--init] [--branch <Branch_Name>] ')
    .option('b', {
        alias: 'branch',
        describe: 'specify a branch of your table project'
    })
    .option('i', {
        alias: 'init',
        describe: 'create table-vc.json in this project'
    })
    .help('h')
    .alias('h', 'help')
    .version(packageObj.version)
    .argv

const fs = require('fs-extra')

const {loadTable} = require('./index')

const EXECUTE_PATH = process.cwd()
const CONFIG_PATH = Path.resolve(EXECUTE_PATH, "table-vc.json")
const CONFIG_PATH_JS = Path.resolve(EXECUTE_PATH, "table-vc.js")

function logError(...args) {
    console.log(chalk.red(...args, '!'));
}

function logInfo(...args) {
    console.log(chalk.blue(...args));
}

let {branch, init} = argv;

const config = require('./config.default')

if(!branch && !init) {
    Yargs.showHelp()
}

if(init){
    if(fs.pathExistsSync(CONFIG_PATH)) {
        logError(`the file ${CONFIG_PATH} are already exist.`)
    }else {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`git repo url (default:${config.repoUrl}): `, (repoUrl) => {
            config.repoUrl = repoUrl || config.repoUrl
            rl.question(`utput dir (default:${config.tableDir}): `, (tableDir) => {
                config.tableDir = tableDir || config.tableDir
                rl.question(`default git brunch for "latest" (default:${config.branch.latest}): `, (latest) => {
                    config.branch.latest = latest || config.branch.latest
                    fs.writeJsonSync(CONFIG_PATH, config, {
                        spaces: 2,
                        replacer: ' '
                    })
                    logInfo(`the file ${chalk.yellow(CONFIG_PATH)} created.`)
                    rl.close();
                })
            })
        });
    }
}

if(branch) {
    const configUser =
        fs.pathExistsSync(CONFIG_PATH) ?
            fs.readJsonSync(CONFIG_PATH) : (fs.pathExistsSync(CONFIG_PATH_JS) ? require(CONFIG_PATH_JS) : {})

    for (let key in configUser) {
        if (configUser[key]) {
            config[key] = configUser[key]
        }
    }

    const run = async function (branch) {
        const {repoUrl, tableDir} = config
        const targetVersion = config.branch[branch]
        if (!targetVersion) {
            logError(`the version [${branch}] are not set in the config file.`)
            return;
        }
        logInfo(`start get table(${chalk.yellow(repoUrl)}) branch ${chalk.yellow(branch)}[${chalk.green(targetVersion)}] to ${chalk.yellow(tableDir)}.`, repoUrl, tableDir);
        await loadTable(repoUrl, Path.resolve(EXECUTE_PATH, tableDir), targetVersion).catch(logError)
    }

    run(branch)
}

