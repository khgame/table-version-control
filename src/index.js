#!/usr/bin/env node

const { Git } = require('kht');
const fs = require('fs-extra')
const Path = require('path')

module.exports = {
    loadTable: async (repoUrl, dirOut, version) => {
        console.log(repoUrl, dirOut, version)
        fs.removeSync(dirOut);
        await Git.fetchAsFiles(repoUrl, dirOut, version).catch(err => {
            console.log("get tables failed", err)
            fs.removeSync(dirOut);
        })
    }
}

