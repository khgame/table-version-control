"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var Path = require('path');

var chalk = require('chalk');

var readline = require('readline');

var packageObj = require('../package.json');

var Yargs = require('yargs');

var argv = Yargs.usage('Usage: table-vc [--init] [--branch <Branch_Name>] ').option('b', {
  alias: 'branch',
  describe: 'specify a branch of your table project'
}).option('i', {
  alias: 'init',
  describe: 'create table-vc.json in this project'
}).help('h').alias('h', 'help').version(packageObj.version).argv;

var fs = require('fs-extra');

var _require = require('./index'),
    loadTable = _require.loadTable;

var EXECUTE_PATH = process.cwd();
var CONFIG_PATH = Path.resolve(EXECUTE_PATH, "table-vc.json");
var CONFIG_PATH_JS = Path.resolve(EXECUTE_PATH, "table-vc.js");

function logError() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  console.log(chalk.red.apply(chalk, args.concat(['!'])));
}

function logInfo() {
  console.log(chalk.blue.apply(chalk, arguments));
}

var branch = argv.branch,
    init = argv.init;

var config = require('./config.default');

if (!branch && !init) {
  Yargs.showHelp();
}

if (init) {
  if (fs.pathExistsSync(CONFIG_PATH)) {
    logError("the file ".concat(CONFIG_PATH, " are already exist."));
  } else {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("git repo url (default:".concat(config.repoUrl, "): "), function (repoUrl) {
      config.repoUrl = repoUrl || config.repoUrl;
      rl.question("utput dir (default:".concat(config.tableDir, "): "), function (tableDir) {
        config.tableDir = tableDir || config.tableDir;
        rl.question("default git brunch for \"latest\" (default:".concat(config.branch.latest, "): "), function (latest) {
          config.branch.latest = latest || config.branch.latest;
          fs.writeJsonSync(CONFIG_PATH, config, {
            spaces: 2,
            replacer: ' '
          });
          logInfo("the file ".concat(chalk.yellow(CONFIG_PATH), " created."));
          rl.close();
        });
      });
    });
  }
}

if (branch) {
  var configUser = fs.pathExistsSync(CONFIG_PATH) ? fs.readJsonSync(CONFIG_PATH) : fs.pathExistsSync(CONFIG_PATH_JS) ? require(CONFIG_PATH_JS) : {};

  for (var key in configUser) {
    if (configUser[key]) {
      config[key] = configUser[key];
    }
  }

  var run =
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee(branch) {
      var repoUrl, tableDir, targetVersion;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              repoUrl = config.repoUrl, tableDir = config.tableDir;
              targetVersion = config.branch[branch];

              if (targetVersion) {
                _context.next = 5;
                break;
              }

              logError("the version [".concat(branch, "] are not set in the config file."));
              return _context.abrupt("return");

            case 5:
              logInfo("start get table(".concat(chalk.yellow(repoUrl), ") branch ").concat(chalk.yellow(branch), "[").concat(chalk.green(targetVersion), "] to ").concat(chalk.yellow(tableDir), "."), repoUrl, tableDir);
              _context.next = 8;
              return loadTable(repoUrl, Path.resolve(EXECUTE_PATH, tableDir), targetVersion).catch(logError);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function run(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  run(branch);
}