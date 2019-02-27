"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('kht'),
    Git = _require.Git;

var fs = require('fs-extra');

var Path = require('path');

module.exports = {
  loadTable: function () {
    var _loadTable = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee(repoUrl, dirOut, version) {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log(repoUrl, dirOut, version);
              fs.removeSync(dirOut);
              _context.next = 4;
              return Git.clone(repoUrl, dirOut, version).catch(function (err) {
                console.log("get tables failed", err);
                fs.removeSync(dirOut);
              }).then(function (ts) {
                return fs.removeSync(Path.resolve(dirOut, '.git'));
              });

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function loadTable(_x, _x2, _x3) {
      return _loadTable.apply(this, arguments);
    }

    return loadTable;
  }()
};