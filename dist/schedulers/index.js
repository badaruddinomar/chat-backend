'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.startSchedulers = void 0;
const removeUnverifiedAccounts_1 = require('@/schedulers/removeUnverifiedAccounts');
const startSchedulers = () => {
  (0, removeUnverifiedAccounts_1.removeUnverifiedAccounts)();
};
exports.startSchedulers = startSchedulers;
