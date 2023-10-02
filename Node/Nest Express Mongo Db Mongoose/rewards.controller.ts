import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Types } from "mongoose";
import { User } from "src/entities/users/schema";
import { UserFromReq } from "src/shared/decorators";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { UserAccessToTheClient } from "src/shared/guards/user-access-client.guard";
import { ParseObjectIdPipe } from "src/shared/pipes/ObjectId.pipe";
import {
  CreateChildRewardDto,
  CreateReward,
  ReorderReward,
  UpdateReward,
} from "./dto";
import { RewardsService } from "./rewards.service";

@Controller("rewards")
@UseGuards(AuthGuard)
export class RewardsController {
  constructor(private rs: RewardsService) {}
  @Post("/library")
  async create(@Body() rewardData: CreateReward, @UserFromReq() user: User) {
    const reward = await this.rs.create(rewardData, user);
    return reward;
  }
  @Post("/child-library")
  @UseGuards(UserAccessToTheClient)
  async createChild(
    @Body() rewardData: CreateChildRewardDto,
    @UserFromReq() user: User
  ) {
    const reward = await this.rs.createForChild(rewardData, user);
    return reward;
  }

  @Get("/library")
  async getUserLibrary(@UserFromReq() user: User) {
    const rewards = await this.rs.getUserRewardsLibrary(user);
    return rewards;
  }
  @Get("/child-library/:clientId")
  @UseGuards(UserAccessToTheClient)
  async getClientLibrary(
    @Param("clientId", ParseObjectIdPipe) clientId,
    @UserFromReq() user: User
  ) {
    const rewards = await this.rs.getUserRewardsForChild(
      clientId as Types.ObjectId,
      user
    );
    return rewards;
  }
  @Post("/child-library/reorder")
  async reorderChildLibrary(@Body() data: ReorderReward) {
    return this.rs.reorderChildLibrary(data);
  }

  @Delete("/:id")
  async deleteById(
    @Param("id", ParseObjectIdPipe) rewardId,
    @UserFromReq() user: User
  ) {
    const reward = await this.rs.delete(rewardId as Types.ObjectId, user);
    return reward;
  }

  @Get("/:id")
  async getOne(
    @Param("id", ParseObjectIdPipe) rewardId,
    @UserFromReq() user: User
  ) {
    const reward = await this.rs.getByIdWithCreatedBy(
      rewardId as Types.ObjectId,
      user
    );
    return reward;
  }

  @Put("/:id")
  async update(
    @Param("id", ParseObjectIdPipe) rewardId,
    @Body() rewardData: UpdateReward,
    @UserFromReq() user: User
  ) {
    const reward = await this.rs.update(
      rewardId as Types.ObjectId,
      rewardData,
      user
    );
    return reward;
  }
}
