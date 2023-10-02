import { UserDetails, UserNotification } from 'shared/types';

import { SocketIOService } from '.';

const UPDATE_MICROSTATUS = 'microstatusChanged';
const SEND_NOTIFICATION = 'sendNotification';
const DEACTIVATE_USER = 'deactivateUser';
const REMOVE_NOTIFICATION = 'removeNotification';

class SocketUSerService {
  static get isInitialized() {
    return (
      SocketIOService.socket.listeners(UPDATE_MICROSTATUS).length > 0 &&
      SocketIOService.socket.listeners(SEND_NOTIFICATION).length > 0 &&
      SocketIOService.socket.listeners(DEACTIVATE_USER).length > 0
    );
  }

  static onMicrostatusChange(microstatus: string): void {
    SocketIOService.socket.emit(UPDATE_MICROSTATUS, { microstatus });
  }

  static onMicrostatus(callback: (newUser: UserDetails) => void): void {
    SocketIOService.socket.on(UPDATE_MICROSTATUS, (newUser: UserDetails) => {
      callback(newUser);
    });
  }

  static getNewNotification(callback: (newUser: UserNotification) => void): void {
    SocketIOService.socket.on(SEND_NOTIFICATION, (notification: UserNotification) => {
      callback(notification);
    });
  }

  static onDeactivateUser(callback: () => void): void {
    SocketIOService.socket.on(DEACTIVATE_USER, callback);
  }

  static onRemoveNotification(callback: (notificationId: number) => void): void {
    SocketIOService.socket.on(REMOVE_NOTIFICATION, callback);
  }
}

export default SocketUSerService;
