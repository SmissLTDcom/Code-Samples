import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { concat, omit } from 'lodash';
import { DateTime } from 'luxon';
import { PrismaService } from 'nestjs-prisma';

import {
  generateWhereQuery,
  getOrganisationQuery,
  getSearchQuery,
} from '../../shared/utils';
import type { User } from '../user/models/user.model';
import type { CreateJobInput } from './dto/create-job.input';
import type { GetJobStatArgs } from './dto/get-job-stat.args';
import type { GetJobsArgs } from './dto/get-jobs.args';
import type { UpdateJobInput } from './dto/update-job.input';
import type {
  Job,
  JobStats,
  JobWithStats,
  PaginatedJob,
} from './models/job.model';
import { predefinedStages } from './models/stage.model';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async createJob(data: CreateJobInput, user: User): Promise<Job> {
    const recruiters = await this.prisma.user.findMany({
      where: {
        id: {
          in: data.recruiterIds,
        },
        organisationId: user.organisationId,
      },
    });

    const recruitersValid = recruiters.length === data.recruiterIds.length;
    if (!recruitersValid)
      throw new BadRequestException(`Invalid recruiter supplied`);

    const hiringTeam = await this.prisma.user.findMany({
      where: {
        id: {
          in: data.hiringTeamIds,
        },
        organisationId: user.organisationId,
      },
    });

    const hiringTeamValid = hiringTeam.length === data.hiringTeamIds.length;
    if (!hiringTeamValid)
      throw new BadRequestException(`Invalid recruiter supplied`);

    const hiringManager = await this.prisma.user.findFirst({
      where: {
        id: data.hiringManagerId,
        organisationId: user.organisationId,
      },
    });

    if (!hiringManager)
      throw new BadRequestException(`Invalid hiring manager supplied`);

    const stages = concat(
      predefinedStages,
      data.stages.map(({ name }) => ({
        name,
        type: null,
      })),
    );

    const job = await this.prisma.job.create({
      data: {
        name: data.name,
        salary: data.salary,
        location: data.location,
        contract: data.contract,
        hiringManager: {
          connect: {
            id: data.hiringManagerId,
          },
        },
        organisation: {
          connect: {
            id: user.organisationId,
          },
        },
        department: {
          connect: {
            id: data.departmentId,
          },
        },
        jobBoardShow: data.jobBoard.show,
        shortDescription: data.jobBoard.shortDescription,
        longDescription: data.jobBoard.longDescription,
        recruiters: {
          connect: recruiters.map(({ id }) => ({ id })),
        },
        hiringTeam: {
          connect: hiringTeam.map(({ id }) => ({ id })),
        },
        stages: {
          create: stages.map((stage, index) => ({ ...stage, index })),
        },
        questions: {
          create: data.questions.map((question, index) => ({
            ...question,
            index,
          })),
        },
      },
      include: {
        hiringManager: true,
        recruiters: true,
        hiringTeam: true,
        stages: true,
        questions: true,
        department: {
          include: { users: true },
        },
      },
    });

    return job;
  }

  async getJobsInOrganisation({
    organisationId,
    limit,
    page,
    search,
    archived,
  }: GetJobsArgs): Promise<PaginatedJob> {
    const skip = limit * (page - 1);
    const where = {
      AND: {
        organisationId,
        AND: getSearchQuery<Job>(search, 'name'),
        archived,
      },
    };

    const total = await this.prisma.job.count({
      where,
    });
    const jobsInOrganisation = await this.prisma.job.findMany({
      where,
      include: {
        hiringManager: true,
        recruiters: true,
        department: true,
        hiringTeam: true,
        questions: true,
      },
      take: limit,
      skip,
    });
    const totalPages = Math.ceil(total / limit);
    return { items: jobsInOrganisation, limit, total, page, totalPages };
  }

  async getJobInOrganisationById(
    jobId: string,
    organisationId: string,
  ): Promise<Job> {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        organisationId,
      },
      include: {
        recruiters: true,
        hiringManager: true,
        department: true,
        hiringTeam: true,
        questions: {
          orderBy: {
            index: 'asc',
          },
        },
      },
    });
    if (!job)
      throw new NotFoundException(`Job with id ${jobId} does not exists `);
    return job;
  }

  async archiveJobById(jobId: string, organisationId: string): Promise<Job> {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        organisationId,
      },
      include: { stages: true },
    });

    if (!job)
      throw new NotFoundException(`Job with id ${jobId} does not exist!`);

    if (job.archived)
      throw new BadRequestException(
        `Job with id ${jobId} is already archived.`,
      );

    const archivedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: { archived: true, jobBoardShow: false },
      include: {
        hiringManager: true,
        recruiters: true,
        hiringTeam: true,
        questions: true,
      },
    });

    return archivedJob;
  }

  async clearArchiveJobById(
    jobId: string,
    organisationId: string,
  ): Promise<Job> {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        organisationId,
      },
      include: { stages: true },
    });

    if (!job)
      throw new NotFoundException(`Job with id ${jobId} does not exist!`);

    if (!job.archived)
      throw new BadRequestException(`Job with id ${jobId} is not archived.`);

    const clearArchivedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: { archived: false },
      include: {
        hiringManager: true,
        recruiters: true,
        hiringTeam: true,
        questions: true,
      },
    });

    return clearArchivedJob;
  }
}
