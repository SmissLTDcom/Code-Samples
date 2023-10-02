import { DeepPartial } from "typeorm";
import { DEFAULT_PAGINATION_LIMIT } from "../constants";
import { Task, User, UserType } from "../entities";
import { UserRepository } from "../repositories";
import {
  TimeFormatter,
  createValidationError,
  dataSource,
  hasRole,
  paginateQuery,
  rejectNotFoundError,
} from "../utils";

const taskSelectFields = [
  "Task.id",
  "Task.name",
  "Task.description",
  "Task.isArchived",
  "Task.createdAt",
  "Task.lastTimeActive",
  "Project.id",
  "Project.name",
  "Task.archivedAt",
];

export const TaskRepository = dataSource.getRepository(Task).extend({
  getTasksWithProjects(user: User, isArchived = false, isToday = false) {
    const { startOfDay } = TimeFormatter.getTodayRangeAccordingToOffset(
      user.tenant.timezone
    );

    // convert to utc as start and end time of time range are stored in DB in utc+0
    const today = startOfDay.toISOString();

    const timeRangeJoinCondition = isArchived
      ? undefined
      : `"TimeRange"."startTime"::timestamptz  >= :today::timestamptz OR "TimeRange"."endTime" IS NULL`;

    const sqlQuery = `"TimeRange"."startTime"::timestamptz >= :today::timestamptz`;

    const query = this.createQueryBuilder()
      .select(taskSelectFields)
      .leftJoin("Task.project", "Project")
      .leftJoinAndSelect(
        "Task.timeRanges",
        "TimeRange",
        timeRangeJoinCondition,
        { today }
      )
      .where("Task.isArchived = :isArchived", { isArchived });

    if (isToday) {
      query.andWhere(sqlQuery, { today });
    }
    query.orderBy("Task.lastTimeActive", "DESC", "NULLS LAST");

    return query;
  },

  getAllTasksWithProjects(isArchived = false) {
    return this.createQueryBuilder()
      .select(taskSelectFields)
      .leftJoin("Task.project", "Project")
      .where("Task.isArchived = :isArchived", { isArchived })
      .orderBy("Task.lastTimeActive", "DESC", "NULLS LAST");
  },

  getUserTodayTasks(user: User, page: number, limit: number) {
    const query = this.getTasksWithProjects(user, false, true)
      .leftJoinAndSelect("Task.user", "User")
      .andWhere("User.id = :userId", { userId: user.id });
    return paginateQuery(query, page, limit);
  },

  getUserTasksQuery(
    user: User,
    isArchived: boolean,
    project?: number,
    filter?: string
  ) {
    const query = this.getTasksWithProjects(user, isArchived).leftJoinAndSelect(
      "Task.user",
      "User"
    );
    if (project) {
      query.andWhere("Task.projectId = :project", { project });
    }
    if (filter) {
      query.andWhere("Task.name ILike :filter", { filter: `%${filter}%` });
    }
    query.andWhere("User.id = :userId", { userId: user.id });

    return query;
  },

  getAllTasksQuery(isArchived: boolean) {
    return this.getAllTasksWithProjects(isArchived).leftJoinAndSelect(
      "Task.user",
      "User"
    );
  },

  getTaskByIdRoleAware(id: number | string, user: User) {
    const query = this.getTasksWithProjects(user).leftJoinAndSelect(
      "Task.user",
      "User"
    );
    const isAdmin = hasRole(user, UserType.ADMIN);
    if (!isAdmin) {
      query.andWhere("Task.user.id = :userID", { userID: user.id });
    }
    query.andWhere("Task.id = :id", { id });

    return query.getOne();
  },

  findAllMyTasks(user: User) {
    const data = this.getUserTasksQuery(user, false);
    return data.getMany();
  },

  findAllUserTasks(
    user: User,
    isArchived: boolean,
    project: number,
    filter: string,
    page: number,
    limit: number
  ) {
    const data = this.getUserTasksQuery(user, isArchived, project, filter);
    return paginateQuery(data, page, limit);
  },

  findLatestUserTask(user: User) {
    return this.getUserTasksQuery(user, false).getOne();
  },

  findAllTenantTasks(isArchived: boolean) {
    return this.getAllTasksQuery(isArchived).getMany();
  },

  async findUserTasksById(
    id: number | string,
    isArchived: boolean,
    project?: number,
    filter?: string,
    page = 1,
    limit = DEFAULT_PAGINATION_LIMIT
  ) {
    const user = await UserRepository.findDetailedUserById(id);
    if (user) {
      const query = this.getTasksWithProjects(user, isArchived);
      if (project) {
        query.andWhere("Task.projectId = :project", { project });
      }
      if (filter) {
        query.andWhere("Task.name ILike :filter", { filter: `%${filter}%` });
      }
      query.andWhere("Task.user.id = :id", { id });
      return paginateQuery(query, page, limit);
    }
    return null;
  },

  async findUserAllTasksById(id: number | string) {
    const user = await UserRepository.findDetailedUserById(id);
    if (user) {
      const query = this.getTasksWithProjects(user, false);
      query.andWhere("Task.user.id = :id", { id });
      return query.getMany();
    }
    return null;
  },

  async findUserTodayTasksById(
    id: number | string,
    page: number,
    limit: number
  ) {
    const user = await UserRepository.findDetailedUserById(id);
    if (user) {
      const query = this.getTasksWithProjects(user, false, true);
      query.andWhere("Task.user.id = :id", { id });
      return paginateQuery(query, page, limit);
    }
    return null;
  },

  findTaskByIdIfUserOwnsTask(taskId: number, userId: number) {
    return this.createQueryBuilder()
      .leftJoinAndSelect("Task.user", "User")
      .where("Task.id = :taskId")
      .andWhere("Task.user.id = :userId")
      .setParameters({ taskId, userId })
      .getOne();
  },

  getFullListOfUsersTasks(userId: string | number) {
    return this.createQueryBuilder()
      .select(taskSelectFields)
      .leftJoinAndSelect("Task.user", "User")
      .leftJoin("Task.project", "Project")
      .where("Task.user.id = :userId", { userId })
      .getMany();
  },

  async createFromBody(
    body: DeepPartial<Task>,
    userId: number,
    requestUser: User
  ) {
    const isAdmin = hasRole(requestUser, UserType.ADMIN);
    const task = this.create(body);

    if (isAdmin) {
      const user = await UserRepository.findDetailedUserById(userId);
      if (user) {
        task.user = user;
      } else return rejectNotFoundError();
    } else {
      task.user = requestUser;
    }
    return task.save();
  },

  async updateFromBody(
    body: DeepPartial<Task>,
    id: number | string,
    user: User
  ) {
    body.id = Number(id);
    const task = await this.preload(body);
    if (!task) return rejectNotFoundError();
    const isAdmin = hasRole(user, UserType.ADMIN);
    const isOwner = task.userId == user.id;
    if (!(isAdmin || isOwner)) return rejectNotFoundError();
    try {
      await task.save();
      return task;
    } catch (error) {
      return Promise.reject(createValidationError(error));
    }
  },

  async deleteInstance(id: string | number, user: User) {
    const task = await this.getTaskByIdRoleAware(id, user);
    if (task) return this.remove(task);
    return Promise.reject();
  },
});
