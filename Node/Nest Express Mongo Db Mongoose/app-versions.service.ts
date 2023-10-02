import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Device } from "../devices/schemas";
import { CreateAppVersionDto } from "./dto/CreateAppVersion.dto";
import { AppVersion } from "./schema/app-version.shema";

@Injectable()
export class AppVersionsService {
  constructor(
    @InjectModel(AppVersion.name) private AppVersion: Model<AppVersion>
  ) {}
  async checkUpgrade(device: Device) {
    const appLatestVersion = await this.AppVersion.findOne({
      $or: [{ appId: device.appId }, { isForMigrated: device.migrated }],
    }).sort({
      createdAt: -1,
    });
    if (!appLatestVersion)
      throw new BadRequestException("Please upload at least one app version");
    const isLatestVersionUsed = device.appVersion >= appLatestVersion.version;

    return {
      deviceAppVersion: device.appVersion,
      isLatestVersionUsed,
      appLatestVersion,
    };
  }
  create(body: CreateAppVersionDto) {
    const newAppVersion = new this.AppVersion(body);
    return newAppVersion.save();
  }
}
