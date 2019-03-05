# table-version-control

value tables version control tool, based on git

## usage

### cli

1. `npm i -g @khgame/table-vc`
2. `cd your_project_dir`
3. using `table-vc --init` to create a `table-vc.json` file
4. using `table-vc --alias` to create alias
5. using `table-vc --update` to fetch tables of locked version
6. using `table-vc --checkout ALIAS|BRANCH_NAME` to checkout selected branch or commits, and then set this version as lock in table-vc.json file

### config

#### schema

the table-vc file is something like this *(the default config)*
```json
{
  "repoUrl": "git@localhost/table.git",
  "tableDir": "tables/in",
  "alias": {
    "master": "master",
    "latest": "master",
    "develop": "develop"
  }
}
```

#### config entry 

- repoUrl : the repoUrl of your table repo
- tableDir : the target directory to put your table files
- alias : cv alias => git branch|commit

example:
- config
    ```json
    {
      ...
      "alias": {
        ...
        "test": "301a05e",
      }
    }
    ```
- usage
    `table-vc -c test`

#### update config

once you checkout a target of the repo, the real branch|commit will be locked in the table-vc.json file

```json
    {
      ...
      "lock": "3885fb105a"
    }
```

therefore, you can easily use `table-vc -u` to sync the table to the locked version

#### practise  

you can this to you package.json

```json
{
  ...
  "scripts": {
    ...
    "table:checkout": "npx table-vc --branch"
  }
}
```
and use ```npm run table:checkout test``` to checkout table branch

### node.js
  
you can also import this lib in your code:

```js
import { loadTable } from '@khgame/table-vc'
```

definition

`loadTable: async (repoUrl, dirOut, version)`
