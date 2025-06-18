import { removeUnverifiedAccounts } from './removeUnverifiedAccounts';

export const startSchedulers = () => {
  removeUnverifiedAccounts();
};
