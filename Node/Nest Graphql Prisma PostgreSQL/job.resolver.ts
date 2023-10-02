import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type DataLoader from 'dataloader';

import { CurrentUser } from '../../shared/decorators';
import { RequireOrganisationGuard } from '../../shared/guards';
import { DataloaderService } from '../dataloader/dataloader.service';
import { User } from '../user/models/user.model';
import { ArchiveJobInput, ClearArchiveJobInput } from './dto/archive-job.input';
import { CreateJobInput } from './dto/create-job.input';
import { GetJobStatArgs } from './dto/get-job-stat.args';
import { GetJobsArgs } from './dto/get-jobs.args';
import { UpdateJobInput } from './dto/update-job.input';
import { JobService } from './job.service';
import { Job, JobWithStats, PaginatedJob } from './models/job.model';
import { JobStage } from './models/stage.model';

@Resolver(() => Job)
@UseGuards(RequireOrganisationGuard)
export class JobResolver {
  stageLoader: DataLoader<string, JobStage[]>;
  constructor(private jobService: JobService, dataloader: DataloaderService) {
    this.stageLoader = dataloader.getLoaders().jobStageLoader;
  }

  @ResolveField(() => [JobStage])
  async stages(@Parent() job: Job) {
    const stages = await this.stageLoader.load(job.id);
    return stages;
  }

  @Mutation(() => Job)
  createJob(
    @CurrentUser() user: User,
    @Args('data') data: CreateJobInput,
  ): Promise<Job> {
    return this.jobService.createJob(data, user);
  }

  @Query(() => PaginatedJob)
  getJobsInOrganisation(
    @CurrentUser() user: User,
    @Args() data: GetJobsArgs,
  ): Promise<PaginatedJob> {
    const { organisationId } = user;
    return this.jobService.getJobsInOrganisation({ ...data, organisationId });
  }

  @Query(() => JobWithStats)
  getJobStats(
    @CurrentUser() user: User,
    @Args() data: GetJobStatArgs,
  ): Promise<JobWithStats> {
    const { organisationId } = user;
    return this.jobService.getJobWithStats({ ...data, organisationId });
  }

  @Query(() => Job)
  getJobById(
    @CurrentUser() user: User,
    @Args('jobId') jobId: string,
  ): Promise<Job> {
    const { organisationId } = user;
    return this.jobService.getJobInOrganisationById(jobId, organisationId);
  }

  @Mutation(() => Job)
  async updateJobById(
    @CurrentUser() user: User,
    @Args('data')
    data: UpdateJobInput,
  ): Promise<Job> {
    return this.jobService.updateJobById(data, user);
  }

  @Mutation(() => Job)
  async archiveJob(
    @CurrentUser() user: User,
    @Args('data')
    data: ArchiveJobInput,
  ): Promise<Job> {
    return this.jobService.archiveJobById(data.id, user.organisationId);
  }

  @Mutation(() => Job)
  async clearArchiveJob(
    @CurrentUser() user: User,
    @Args('data')
    data: ClearArchiveJobInput,
  ): Promise<Job> {
    return this.jobService.clearArchiveJobById(data.id, user.organisationId);
  }
}
