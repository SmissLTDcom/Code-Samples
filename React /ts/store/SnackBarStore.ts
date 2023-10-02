import { action, makeObservable, observable } from 'mobx';

import RootStore from 'rootStore';

export interface SnackBarOptions {
  open: boolean;
  severity: SnackBarSeverity;
  message: string;
  autoHideMS: number;
}

export type SnackBarSeverity = 'success' | 'info' | 'warning' | undefined;

export default class SnackBarStore {
  static DEFAULT_AUTO_HIDE_DURATION = 5000;

  @observable snackBarOptions: SnackBarOptions = {
    open: false,
    severity: undefined,
    message: '',
    autoHideMS: SnackBarStore.DEFAULT_AUTO_HIDE_DURATION,
  };

  rootStore: RootStore;

  constructor(RootStore: RootStore) {
    makeObservable(this);
    this.rootStore = RootStore;
  }

  @action showSnackBar = (
    message: string,
    severity: SnackBarSeverity,
    autoHideMS = SnackBarStore.DEFAULT_AUTO_HIDE_DURATION,
  ): void => {
    this.snackBarOptions = {
      open: true,
      severity,
      message,
      autoHideMS,
    };
  };

  @action closeSnackBar = (): void => {
    this.snackBarOptions = { ...this.snackBarOptions, open: false };
  };
}
