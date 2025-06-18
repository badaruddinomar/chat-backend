import { removeUnverifiedAccounts } from '@/schedulers/removeUnverifiedAccounts';
export const startSchedulers = () => {
  removeUnverifiedAccounts();
};
