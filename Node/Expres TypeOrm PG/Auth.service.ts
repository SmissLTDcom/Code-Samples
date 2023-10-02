import { AccessToken, UserType, User, TenantWorkingTime } from "../entities";
import {
  UserRepository,
  TenantRepository,
  PersonalWorkingTimeRepository,
  VacationSnapshotRepository,
} from "../repositories";
import { createValidationError, dataSource } from "../utils";
import { CronService } from "./Cron.service";

export class AuthService {
  static async authenticateUser(user: User) {
    if (!user.token) {
      const token = new AccessToken();
      token.user = user;
      user.token = token;
    }
    user.token.updatedAt = new Date();
    await user.token.save();
    return await UserRepository.findWithTokenById(user?.id);
  }

  static async loginUser(email: string, password: string) {
    const user = await UserRepository.findByEmailAndPassword(email, password);
    if (user) {
      return this.authenticateUser(user);
    } else return null;
  }

  static async getUserByEmail(email: string) {
    const user = await UserRepository.findUserByEmail(email);
    if (user) {
      return user;
    } else return null;
  }

  static async getUserByTelegramId(telegramId: number) {
    const user = await UserRepository.findUserByTelegramId(telegramId);
    if (user) {
      return user;
    } else return null;
  }

  static async changePassword(
    user: User,
    { password, newPassword }: { password: string; newPassword: string }
  ) {
    const userWithPass = await UserRepository.findByEmailAndPassword(
      user.email,
      password
    );
    if (userWithPass) {
      user.password = newPassword;
      return user.save();
    } else {
      return Promise.reject(createValidationError("Old password is incorrect"));
    }
  }

  static async setPassword(
    user: User,
    { password, repeatPassword }: { password: string; repeatPassword: string }
  ) {
    const userWithEmail = await UserRepository.findUserByEmail(user.email);
    if (userWithEmail && password === repeatPassword) {
      user.password = repeatPassword;
      return user.save();
    } else {
      return Promise.reject(createValidationError("Passwords do not match"));
    }
  }

  static registerUser(
    email: string,
    tenant_name: string,
    timezone: string,
    password: string
  ): Promise<User | null> {
    return new Promise(async (resolve, reject) => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const newTenant = TenantRepository.create({
          name: tenant_name,
          timezone,
        });
        await newTenant.save();

        const tenantWorkingTime = new TenantWorkingTime();
        tenantWorkingTime.tenant = newTenant;
        await tenantWorkingTime.save();

        const user = new User();
        Object.assign(user, {
          email,
          password,
          userType: [UserType.ADMIN],
          tenant: newTenant,
          englishLevel: null,
          confirmPassword: false,
          birthday: "1990-01-01",
        });
        await user.save();

        const { id: _, tenant: __, ...workingTimeSchedule } = tenantWorkingTime;
        const userWorkingTime = PersonalWorkingTimeRepository.create({
          ...workingTimeSchedule,
          user,
        });
        await userWorkingTime.save();

        await VacationSnapshotRepository.createSnapshot(user);

        await queryRunner.commitTransaction();

        const authenticatedUser = await this.authenticateUser(user);
        resolve(authenticatedUser);

        CronService.registerTasks([newTenant]);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        reject(error);
      } finally {
        await queryRunner.release();
      }
    });
  }
}
