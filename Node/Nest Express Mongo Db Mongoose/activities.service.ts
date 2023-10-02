import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/entities/users/schema";
import { CreateActivityDto, ReorderActivity } from "./dto";
import { Activity } from "./schema/activity.schema";

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private ActivityModel: Model<Activity>
  ) {}

  find(activity: Partial<Activity>) {
    return this.ActivityModel.find(activity).sort("ordering").lean();
  }
  createMany(actData: CreateActivityDto[], user: User) {
    const activities = actData.map((e) => {
      const act = new this.ActivityModel(e);
      act.createdBy = user._id;
      return act;
    });

    return this.ActivityModel.insertMany(activities);
  }
  async update(activityId, user: User, activityData: Partial<Activity>) {
    const activity = await this.getByIdWithCreatedBy(activityId, user);
    const updatedActivity = await this.ActivityModel.findByIdAndUpdate(
      activity._id,
      activityData,
      { new: true }
    );
    return updatedActivity;
  }

  async getById(id) {
    const activity = await this.ActivityModel.findById(id);
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
  }
  async getByIdWithCreatedBy(activityId, user: User): Promise<Activity> {
    const activity = await this.ActivityModel.findOne({
      _id: activityId,
      createdBy: user._id,
    });
    if (!activity)
      throw new NotFoundException(
        `Activity ${activityId}, for user ${user._id} not found`
      );
    return activity;
  }
  async getActivitiesForUser(user: User): Promise<Activity[]> {
    const activities = await this.ActivityModel.find({
      createdBy: user._id,
      clientId: null,
    });
    return activities;
  }

  async deleteById(activityId, user: User) {
    const activity = await this.getByIdWithCreatedBy(activityId, user);
    await this.ActivityModel.findByIdAndDelete(activity._id);

    return;
  }

  async getMaxMinTimeByIdsDbVersion(ids): Promise<any> {
    const data = await this.ActivityModel.aggregate([
      { $match: { routineId: { $in: ids } } },
      {
        $group: {
          _id: "$routineId",
          minTime: { $sum: "$minCompletionTime" },
          maxTime: { $sum: "$maxCompletionTime" },
        },
      },
      {
        $group: {
          _id: null,
          minMaxTime: {
            $push: {
              k: { $toString: "$_id" },
              v: { minTime: "$minTime", maxTime: "$maxTime" },
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: "$minMaxTime" },
        },
      },
    ]);

    return data;
  }

  async getMaxMinTimeByIdsArrVersion(ids): Promise<any> {
    const data = await this.ActivityModel.aggregate([
      { $match: { routineId: { $in: ids } } },
      {
        $group: {
          _id: "$routineId",
          minTime: { $sum: "$minCompletionTime" },
          maxTime: { $sum: "$maxCompletionTime" },
        },
      },
    ]);
    return data;
  }

  deleteByRoutineId(routineId) {
    return this.ActivityModel.remove({ routineId });
  }
}
