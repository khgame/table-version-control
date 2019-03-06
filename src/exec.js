#!/usr/bin/env node

const Path = require('path')
const chalk = require('chalk')

const { ConsoleHelper } = require('kht')

const packageObj = require('../package.json')

const Yargs = require('yargs')
const argv = Yargs
    .usage('Usage: table-vc [--init|-i] [--alias|-a] [--checkout|-c <Branch_Name>] [--update|-u]')
    .option('i', {
        alias: 'init',
        describe: 'create table-vc.json in this project'
    })
    .option('a', {
        alias: 'alias',
        describe: 'create branch alias to table-vc.json'
    })
    .option('u', {
        alias: 'update',
        describe: 'update tables by locked target in table-vc.json'
    })
    .option('c', {
        alias: 'checkout',
        describe: 'specify a branch of your table project'
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

let {init, alias, update, checkout} = argv;

const config = require('./config.default')

if (!init && !alias && !update && !checkout) {
    Yargs.showHelp()
}

function getUserConfig(){
    const setConfig = fs.pathExistsSync(CONFIG_PATH) ? fs.readJsonSync(CONFIG_PATH) : undefined;
    const configUser = setConfig ? setConfig : (fs.pathExistsSync(CONFIG_PATH_JS) ? require(CONFIG_PATH_JS) : {})
    return configUser
}

async function checkoutBranch(checkout) {
    const configUser = getUserConfig()

    for (let key in configUser) {
        if (configUser[key]) {
            config[key] = configUser[key]
        }
    }

    const run = async function (checkout) {
        const {repoUrl, tableDir} = config
        const targetVersion = config.alias[checkout] || checkout
        if (!targetVersion) {
            logError(`the version [${checkout}] are not set in the config file.`)
            return;
        }
        logInfo(`start get table(${chalk.yellow(repoUrl)}) ${chalk.yellow(checkout)}[${chalk.green(targetVersion)}] to ${chalk.yellow(tableDir)}.`, repoUrl, tableDir);
        await loadTable(repoUrl, Path.resolve(EXECUTE_PATH, tableDir), targetVersion).catch(logError)
        configUser.lock = targetVersion;
        fs.writeJsonSync(CONFIG_PATH, configUser, {
            spaces: 2,
            replacer: ' '
        })
        logInfo(`config updated`)
    }

    await run(checkout)
}

const Handlers = {
    init: async ()=> {
        if (fs.pathExistsSync(CONFIG_PATH)) {
            logError(`the file ${CONFIG_PATH} are already exist.`)
            return;
        }
        config.repoUrl = (await ConsoleHelper.question(`git repo url (default:${config.repoUrl}): `)) || config.repoUrl
        config.tableDir = (await ConsoleHelper.question(`input dir (default:${config.tableDir}): `)) || config.tableDir
        config.alias.latest = (await ConsoleHelper.question(`default git brunch for "latest" (default:${config.alias.latest}): `)) || config.alias.latest
        fs.writeJsonSync(CONFIG_PATH, config, {
            spaces: 2,
            replacer: ' '
        })
        logInfo(`the file ${chalk.yellow(CONFIG_PATH)} created.`)
    },
    setAlias: async ()=> {
        const aliasName = (await ConsoleHelper.question(`alias name: `))
        if(!aliasName) {
            logError('alias name must exist.');
        }
        const targetBranch = (await ConsoleHelper.question(`target git commit/branch: `))
        if(!targetBranch) {
            logError('target must exist.');
        }
        const configUser = getUserConfig()
        configUser.alias = configUser.alias || {}
        configUser.alias[aliasName.trim()] = targetBranch
        fs.writeJsonSync(CONFIG_PATH, configUser, {
            spaces: 2,
            replacer: ' '
        })
        logInfo(`the alias ${chalk.yellow(aliasName)}: ${chalk.yellow(targetBranch)} created.`)
    },
    update: async ()=>{
        const configUser = getUserConfig()
        if(configUser.lock) {
            await checkoutBranch(configUser.lock)
        }else{
            logInfo(`locked version not found.`)
        }
    },
    checkout: async (target)=>{
        await checkoutBranch(checkout)
    }
}

async function go() {

    if (init) {
        await Handlers.init()
    }

    if (alias) {
        await Handlers.setAlias()
    }

    if(update) {
        await Handlers.update()
    }

    if (checkout) {
        await Handlers.checkout()
    }
}

go()
