import { action, makeObservable, observable } from "mobx";

import RootStore from "rootStore";
import { AuthService } from "services/http";
import { ChangePassword, TelegramData } from "shared/types";

class LoginStore {
  rootStore: RootStore;
  @observable loginSubmitting: boolean;
  @observable resetStatus: boolean;
  @observable authorizationError: string | undefined;
  @observable lastResetPasswordRequest: Date | null;

  constructor(rootStore: RootStore) {
    makeObservable(this);
    this.rootStore = rootStore;
    this.loginSubmitting = false;
    this.resetStatus = false;
    this.lastResetPasswordRequest = null;
  }

  @action async submitAndLogin(
    email: string,
    password: string,
    rememberMe?: boolean
  ) {
    try {
      this.loginSubmitting = true;
      const user = await AuthService.login(email, password);
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
      this.rootStore.userStore.setToken(user.token);
      return user;
    } catch (error) {
      const { response } = error;
      this.setAuthorizationError(response?.data.message);
    } finally {
      this.loginSubmitting = false;
    }
  }

  @action async changePassword(
    id: string,
    password: string
  ): Promise<ChangePassword> {
    const data: ChangePassword = {
      password,
    };
    const result = await AuthService.changePassword(id, data);
    return result;
  }

  setAuthorizationError = (message: string): void => {
    this.authorizationError = message;
  };

  clearError = (): void => {
    this.authorizationError = "";
  };

  @action async telegramLogin(data: TelegramData): Promise<void> {
    try {
      this.loginSubmitting = true;
      const user = await AuthService.telegramLogin(data);
      this.rootStore.userStore.setToken(user.token);
      return user;
    } finally {
      this.loginSubmitting = false;
    }
  }
}

export default LoginStore;
