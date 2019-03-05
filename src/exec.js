#!/usr/bin/env node

const Path = require('path')
const chalk = require('chalk')
const readline = require('readline')

const packageObj = require('../package.json')

const Yargs = require('yargs')
const argv = Yargs
    .usage('Usage: table-vc [--init] [--branch <Branch_Name>] ')
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

async function go() {

    if (init) {
        if (fs.pathExistsSync(CONFIG_PATH)) {
            logError(`the file ${CONFIG_PATH} are already exist.`)
        } else {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            await new Promise((resolve => {
                rl.question(`git repo url (default:${config.repoUrl}): `, (repoUrl) => {
                    config.repoUrl = repoUrl || config.repoUrl
                    rl.question(`utput dir (default:${config.tableDir}): `, (tableDir) => {
                        config.tableDir = tableDir || config.tableDir
                        rl.question(`default git brunch for "latest" (default:${config.alias.latest}): `, (latest) => {
                            config.alias.latest = latest || config.alias.latest
                            fs.writeJsonSync(CONFIG_PATH, config, {
                                spaces: 2,
                                replacer: ' '
                            })
                            logInfo(`the file ${chalk.yellow(CONFIG_PATH)} created.`)
                            rl.close();
                            resolve();
                        })
                    })
                });
            }))
        }
    }

    if (alias) {
        await new Promise((resolve => {
            rl.question(`alias name: `, (aliasName) => {
                rl.question(`target git commit/branch: `, (branch) => {
                    const configUser = getUserConfig()
                    configUser[aliasName] = branch
                    fs.writeJsonSync(CONFIG_PATH, configUser, {
                        spaces: 2,
                        replacer: ' '
                    })
                    logInfo(`the alias ${chalk.yellow(aliasName)}: ${chalk.yellow(branch)} created.`)
                    rl.close();
                    resolve();
                })
            });
        }))
    }

    if(update) {
        const configUser = getUserConfig()
        if(configUser.lock) {
            await checkoutBranch(configUser.lock)
        }else{
            logInfo(`locked version not found.`)
        }
    }

    if (checkout) {
        await checkoutBranch(checkout)
    }
}

go()
