# table-version-control

tools and standards for game value tables version control

## usage

### cli

1. `npm i -g @khgame/table-vc`
2. `cd your_project_dir`
3. using `table-vc --init` create a `table-vc.json` file
4. using `table-vc --branch latest|BRANCH_NAME` to checkout selected branch or commits

### config

#### schema

the table-vc file is something like this *(the default config)*
```json
{
  "repoUrl": "git@localhost/table.git",
  "tableDir": "tables/in",
  "branch": {
    "master": "master",
    "latest": "master",
    "develop": "develop"
  }
}
```

#### config entry 

- repoUrl : the repoUrl of your table repo
- tableDir : the target directory to put your table files
- branch : cv branch => git branch|commit

example:
- config
    ```json
    {
      ...
      "branch": {
        ...
        "test": "301a05e",
      }
    }
    ```
- usage
    `table-vc test`

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
